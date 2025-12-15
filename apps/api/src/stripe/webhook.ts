// apps/api/src/stripe/webhook.ts

import { Request, Response } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

let redis: IORedis | null = null;
if (process.env.REDIS_URL) {
  redis = new IORedis(process.env.REDIS_URL);
}

const grantQueue = new Queue("grant-access", { connection: redis });
const revokeQueue = new Queue("revoke-access", { connection: redis });

/**
 * Map Stripe status to our Prisma subscription status
 */
function mapStripeStatusToPrisma(stripeStatus?: string) {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";

    case "past_due":
      return "past_due";

    case "canceled":
      return "canceled";

    case "incomplete":
    case "incomplete_expired":
    case "unpaid":
      return "unpaid";

    default:
      return "active";
  }
}

export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("🔵 Stripe Event:", event.type);

    // ---------------------------------------------------------------------
    // CHECKOUT SUCCESS → CREATE SUBSCRIPTION & GRANT ACCESS
    // ---------------------------------------------------------------------
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Expand the subscription
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["subscription"],
      });

      const productIds = fullSession.metadata?.productIds
  ?.split(",")
  .map((id) => id.trim())
  .filter(Boolean);

if (!productIds || productIds.length === 0) {
  console.error("❌ Missing productIds in session metadata");
  return res.json({ received: true });
}

const products = await prisma.product.findMany({
  where: { id: { in: productIds } },
});

if (products.length === 0) {
  console.error("❌ No valid products found for:", productIds);
  return res.json({ received: true });
}


      const email = fullSession.customer_details?.email;
      if (!email) {
        console.error("❌ Checkout session missing email");
        return res.json({ received: true });
      }

      // Upsert user
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email },
      });

      const stripeSub = fullSession.subscription as Stripe.Subscription | null;

      for (const product of products) {
  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      productId: product.id,
      status: mapStripeStatusToPrisma(stripeSub?.status),
      stripeSubscriptionId: `${stripeSub?.id}:${product.id}`,
      stripeCheckoutSessionId: session.id,
      currentPeriodEnd: stripeSub?.current_period_end
        ? new Date(stripeSub.current_period_end * 1000)
        : null,
    },
  });

  console.log("🟢 Subscription saved:", subscription.id, "→", product.title);

  await grantQueue.add("grant", {
    subscriptionId: subscription.id,
    email,
    platform: "telegram",
  });
}


      console.log("📨 grant-access job queued");
    }

    // ---------------------------------------------------------------------
    // PAYMENT FAILED → UPDATE STATUS + REVOKE ACCESS
    // ---------------------------------------------------------------------
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;

      const stripeSubscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : (invoice.subscription as any)?.id;

      if (!stripeSubscriptionId) return res.json({ received: true });

      const sub = await prisma.subscription.findFirst({
        where: {
          stripeSubscriptionId: {
            startsWith: stripeSubscriptionId,
          },
        },
      });

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "past_due" },
        });

        await revokeQueue.add("revoke", {
          subscriptionId: sub.id,
          reason: "invoice.payment_failed",
        });

        console.log("🔻 revoke job (payment_failed):", sub.id);
      }
    }

    // ---------------------------------------------------------------------
    // CUSTOMER SUBSCRIPTION DELETED / CANCELED / EXPIRED
    // ---------------------------------------------------------------------
    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.unpaid" ||
      event.type === "customer.subscription.canceled" ||
      event.type === "customer.subscription.incomplete_expired"
    ) {
      const stripeSub = event.data.object as Stripe.Subscription;

      const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: stripeSub.id },
      });

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: mapStripeStatusToPrisma(stripeSub.status) },
        });

        await revokeQueue.add("revoke", {
          subscriptionId: sub.id,
          reason: event.type,
        });

        console.log("🔻 revoke job queued for event:", event.type, "->", sub.id);
      }
    }

    // ---------------------------------------------------------------------
    // PAYMENT SUCCEEDED → MARK ACTIVE + GRANT ACCESS
    // ---------------------------------------------------------------------
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      const stripeSubscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : (invoice.subscription as any)?.id;

      if (!stripeSubscriptionId) return res.json({ received: true });

      const sub = await prisma.subscription.findFirst({
       where: {
          stripeSubscriptionId: {
            startsWith: stripeSubscriptionId,
          },
        },
      });

      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "active" },
        });

        await grantQueue.add("grant", {
          subscriptionId: sub.id,
          reason: "invoice.payment_succeeded",
        });

        console.log("🟢 Re-grant queued:", sub.id);
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("❌ Stripe webhook error:", err);
    return res.status(400).send(`Webhook Error: ${(err as any).message}`);
  }
}