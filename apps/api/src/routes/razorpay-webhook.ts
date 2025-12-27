// apps/api/src/routes/razorpay-webhook.ts

import { Router } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { CLUBMINT_PLANS } from "../config/plans";
import { createAlert } from "../utils/createAlert";
import { strictLimiter } from "../middleware/rateLimit";
import { trackEvent } from "../utils/trackEvent";
import { ANALYTICS_EVENTS } from "../analytics/events";

const router = Router();
const prisma = new PrismaClient();

const PLATFORM_FEE_FALLBACK = 10; // %

/* ======================================================
   Helpers
====================================================== */

function verifySignature(req: any) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const body = JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expected === req.headers["x-razorpay-signature"];
}

async function createTelegramAccess(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      product: {
        include: { telegramGroups: true },
      },
    },
  });

  if (!subscription || !subscription.product) return;

  for (const group of subscription.product.telegramGroups) {
    await prisma.accessControl.create({
      data: {
        subscriptionId: subscription.id,
        platform: "telegram",
        status: "pending",
        metadata: {
          groupId: group.id,
          tgGroupId: group.tgGroupId.toString(),
        },
      },
    });
  }
}

/* ======================================================
   Webhook
====================================================== */

router.post("/razorpay", strictLimiter, async (req, res) => {
  if (!verifySignature(req)) {
    console.error("❌ Invalid Razorpay webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const { event, payload } = req.body;

  /* --------------------------------------------------
     CREATOR SUBSCRIPTION EVENTS
  -------------------------------------------------- */

  if (
    event === "subscription.activated" ||
    event === "subscription.charged"
  ) {
    const sub = payload.subscription.entity;

    const creator = await prisma.creator.findFirst({
      where: { razorpaySubId: sub.id },
    });

    if (!creator) return res.sendStatus(200);

    const planEntry = Object.entries(CLUBMINT_PLANS).find(
      ([_, v]) => v.razorpayPlanId === sub.plan_id
    );

    if (!planEntry) return res.sendStatus(200);

    const [planKey, planConfig] = planEntry;

    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        plan: planKey as any,
        commissionPct: planConfig.commissionPct,
        planStartedAt: new Date(),
        planExpiresAt: null,
      },
    });

    await trackEvent({
      creatorId: creator.id,
      sessionId: sub.id,
      event:
        event === "subscription.activated"
          ? ANALYTICS_EVENTS.SUBSCRIPTION_CREATED
          : ANALYTICS_EVENTS.SUBSCRIPTION_RENEWED,
      entityType: "subscription",
      entityId: sub.id,
      metadata: { plan: planKey, provider: "razorpay" },
    });
  }

  if (event === "subscription.payment_failed") {
    const sub = payload.subscription.entity;

    const creator = await prisma.creator.findFirst({
      where: { razorpaySubId: sub.id },
    });

    if (creator) {
      await createAlert(
        creator.id,
        "payment_failed",
        "Subscription payment failed",
        { razorpaySubscriptionId: sub.id }
      );

      await trackEvent({
        creatorId: creator.id,
        sessionId: sub.id,
        event: ANALYTICS_EVENTS.PAYMENT_FAILED,
        entityType: "subscription",
        entityId: sub.id,
      });
    }
  }

  if (
    event === "subscription.cancelled" ||
    event === "subscription.completed" ||
    event === "subscription.halted"
  ) {
    const sub = payload.subscription.entity;

    await prisma.creator.updateMany({
      where: { razorpaySubId: sub.id },
      data: {
        plan: "free",
        commissionPct: CLUBMINT_PLANS.free.commissionPct,
        razorpaySubId: null,
        planExpiresAt: new Date(),
      },
    });

    await prisma.accessControl.updateMany({
      where: {
        subscription: {
          provider: "razorpay",
          providerSubscriptionId: sub.id,
        },
      },
      data: {
        status: "revoked",
        revokedAt: new Date(),
      },
    });

    await trackEvent({
      creatorId: "unknown",
      sessionId: sub.id,
      event: ANALYTICS_EVENTS.SUBSCRIPTION_CANCELED,
      entityType: "subscription",
      entityId: sub.id,
    });
  }

  /* --------------------------------------------------
     PAYMENT CAPTURED → LEDGER CREATION
  -------------------------------------------------- */

  if (event === "payment.captured") {
    const paymentEntity = payload.payment.entity;

    // 🔑 IMPORTANT: fetch ALL payments for the order
    const payments = await prisma.payment.findMany({
      where: { razorpayOrderId: paymentEntity.order_id },
    });

    if (payments.length === 0) return res.sendStatus(200);

    for (const payment of payments) {
      // Idempotency
      const exists = await prisma.creatorEarning.findUnique({
        where: { paymentId: payment.id },
      });

      if (exists) continue;

      const creator = await prisma.creator.findUnique({
        where: { id: payment.creatorId },
      });

      const commissionPct =
        creator?.commissionPct ?? PLATFORM_FEE_FALLBACK;

      const gross = payment.amount; // paise
      const platformFee = Math.floor(
        (gross * commissionPct) / 100
      );
      const netAmount = gross - platformFee;

      await prisma.creatorEarning.create({
        data: {
          creatorId: payment.creatorId,
          paymentId: payment.id,
          grossAmount: gross,
          platformFee,
          netAmount,
        },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: paymentEntity.id,
          status: "paid",
        },
      });
    }

    await trackEvent({
      creatorId: payments[0].creatorId,
      sessionId: paymentEntity.order_id,
      event: ANALYTICS_EVENTS.PAYMENT_SUCCESS,
      entityType: "payment",
      entityId: paymentEntity.id,
      metadata: {
        amount: paymentEntity.amount,
        currency: "INR",
        provider: "razorpay",
      },
    });

    // Activate subscription access (if applicable)
    const subscription = await prisma.subscription.findFirst({
      where: {
        provider: "razorpay",
        providerSubscriptionId:
          paymentEntity.subscription_id,
      },
    });

    if (subscription && subscription.status !== "active") {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "active" },
      });

      await createTelegramAccess(subscription.id);
    }
  }

  /* --------------------------------------------------
     PAYMENT REFUND → LEDGER REVERSED
  -------------------------------------------------- */

  if (event === "payment.refunded") {
    const paymentEntity = payload.payment.entity;

    await prisma.creatorEarning.updateMany({
      where: {
        payment: {
          razorpayPaymentId: paymentEntity.id,
        },
        status: "PENDING",
      },
      data: { status: "REVERSED" },
    });
  }

  return res.sendStatus(200);
});

export default router;
