import { Router } from "express";
import Razorpay from "razorpay";
import { auth, requireAuth } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { CLUBMINT_PLANS } from "../config/plans";

const router = Router();
const prisma = new PrismaClient();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * POST /billing/subscribe
 */
router.post("/subscribe", requireAuth, async (req, res) => {
  const { plan } = req.body;
  const userId = req.userId!;

  if (!plan || plan === "free") {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const creator = await prisma.creator.findUnique({
    where: { userId },
  });

  if (!creator) {
    return res.status(404).json({ error: "Creator not found" });
  }

  const planConfig = CLUBMINT_PLANS[plan as keyof typeof CLUBMINT_PLANS];

  const subscription = await razorpay.subscriptions.create({
    plan_id: planConfig.razorpayPlanId!,
    customer_notify: 1,
    total_count: 120,
  });

  await prisma.creator.update({
    where: { id: creator.id },
    data: {
      razorpaySubId: subscription.id,
    },
  });

  res.json({
    subscriptionId: subscription.id,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
    select: {
      plan: true,
      commissionPct: true,
      razorpaySubId: true,
      planStartedAt: true,
      planExpiresAt: true,
    },
  });

  if (!creator) {
    return res.status(404).json({ error: "Creator not found" });
  }

  res.json({ ok: true, creator });
});


/* ------------------------------------------------
   CREATE / UPGRADE CREATOR SUBSCRIPTION
------------------------------------------------- */
router.post("/upgrade", requireAuth, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || plan === "free") {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId },
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    const planConfig = CLUBMINT_PLANS[plan as keyof typeof CLUBMINT_PLANS];

    if (!planConfig?.razorpayPlanId) {
      return res.status(500).json({
        error: "Razorpay plan ID missing",
        plan,
      });
    }

    // 🔥 Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planConfig.razorpayPlanId,
      customer_notify: 1,
      total_count: 120,
    });

    // Save subscription ID
    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        razorpaySubId: subscription.id,
      },
    });

    return res.json({
      subscriptionId: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("❌ Razorpay upgrade error:", err);

    return res.status(500).json({
      error: "Subscription creation failed",
      message: err?.message,
    });
  }
});


export default router;
