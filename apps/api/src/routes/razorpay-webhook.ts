import { Router } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { CLUBMINT_PLANS } from "../config/plans";
import { createAlert } from "../utils/createAlert";


const router = Router();
const prisma = new PrismaClient();
async function createAccessForProductSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      product: {
        include: {
          telegramGroups: true,
        },
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

router.post("/razorpay", async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const receivedSignature = req.headers["x-razorpay-signature"];

  if (expectedSignature !== receivedSignature) {
    console.error("❌ Invalid Razorpay webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;
  const payload = req.body.payload;
  

  /* -------------------------------------------
     SUBSCRIPTION ACTIVATED / CHARGED
  ------------------------------------------- */
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

    if (!planEntry) {
      console.error("⚠️ Unknown Razorpay plan ID:", sub.plan_id);
      return res.sendStatus(200);
    }

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
      "Subscription payment failed. Access may be revoked if not resolved.",
      {
        razorpaySubscriptionId: sub.id,
        amount: payload.payment?.entity?.amount,
      }
    );
  }
}


  /* -------------------------------------------
     SUBSCRIPTION CANCELLED / EXPIRED
  ------------------------------------------- */
  if (
    event === "subscription.cancelled" ||
    event === "subscription.completed" ||
    event === "subscription.halted"
  ) {
    const sub = payload.subscription.entity;
    const creator = await prisma.creator.findFirst({
  where: { razorpaySubId: sub.id },
});

if (creator) {
  await createAlert(
    creator.id,
    "subscription_cancelled",
    "Your ClubMint subscription has been cancelled.",
    {
      razorpaySubscriptionId: sub.id,
      event,
    }
  );
}

    await prisma.creator.updateMany({
      where: { razorpaySubId: sub.id },
      data: {
        plan: "free",
        commissionPct: CLUBMINT_PLANS.free.commissionPct,
        razorpaySubId: null,
        planExpiresAt: new Date(),
      },
    });
    // 🔑 STEP B: Revoke product access
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

  }

  if (event === "payment.captured") {
  const payment = payload.payment.entity;

  // Update payment record
  await prisma.payment.updateMany({
    where: {
      razorpayOrderId: payment.order_id,
    },
    data: {
      razorpayPaymentId: payment.id,
      status: "paid",
    },
  });

  // 🔑 STEP B: Activate product subscription access
  const subscription = await prisma.subscription.findFirst({
    where: {
      provider: "razorpay",
      providerSubscriptionId: payment.subscription_id,
    },
  });

  if (subscription && subscription.status !== "active") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "active" },
    });

    await createAccessForProductSubscription(subscription.id);
  }
}




  res.sendStatus(200);
});

export default router;
