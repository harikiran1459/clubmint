import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";
import Razorpay from "razorpay";

const router = Router();
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * POST /payouts/connect
 */
router.post("/connect", requireAuth, async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId },
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    // If already connected, do nothing
    if (creator.razorpayAccountId) {
      return res.json({ ok: true, alreadyConnected: true });
    }

    /**
     * 1️⃣ Create Razorpay Route account
     */
    const account = (await razorpay.accounts.create({
      type: "route",
      email: `${creator.handle}@clubmint.com`,
      phone: "9999999999", // placeholder, updated during onboarding
      contact_name: creator.handle,
      legal_business_name: creator.handle,
      business_type: "individual",
      profile: {
        category: "education",
        subcategory: "online_courses",
      },
    })) as any;

    /**
     * 2️⃣ Save account ID
     */
    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        razorpayAccountId: account.id,
        payoutsEnabled: false,
      },
    });

    /**
     * 3️⃣ Generate onboarding link
     */
    const accountLink = await (razorpay as any).request({
  method: "POST",
  url: `/v2/accounts/${account.id}/links`,
  data: {
    type: "account_onboarding",
    refresh_url: `${process.env.WEB_BASE_URL}/dashboard/payouts`,
    return_url: `${process.env.WEB_BASE_URL}/dashboard/payouts`,
  },
});


    return res.json({
      ok: true,
      onboardingUrl: accountLink.short_url,
    });
  } catch (err) {
    console.error("❌ Payout connect error:", err);
    return res.status(500).json({ error: "Failed to connect payouts" });
  }
});

// GET /payouts/status
router.get("/status", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
    select: {
      stripeAccountId: true, // (your Razorpay account ID)
    },
  });

  if (!creator) {
    return res.status(404).json({ error: "Creator not found" });
  }

  // For now:
  // - if accountId exists → connected
  // - later we’ll enhance with webhook-based status
  res.json({
    connected: Boolean(creator.stripeAccountId),
    accountId: creator.stripeAccountId,
    status: creator.stripeAccountId ? "pending" : "not_connected",
  });
});

// GET /payouts/transactions
router.get("/transactions", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
  });

  if (!creator) {
    return res.status(404).json({ error: "Creator not found" });
  }

  // Only allow after Razorpay account connected
  if (!creator.stripeAccountId) {
    return res.status(403).json({ error: "Payouts not connected" });
  }

  const payments = await prisma.payment.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { title: true } },
      user: { select: { email: true } },
    },
  });

  res.json({
    ok: true,
    payments: payments.map((p) => ({
      id: p.id,
      date: p.createdAt,
      product: p.product.title,
      subscriber: p.user.email
        ? p.user.email.replace(/(.{2}).+(@.+)/, "$1***$2")
        : "Unknown",
      gross: p.amount,
      commission: p.commission,
      net: p.creatorAmount,
      status: p.status,
    })),
  });
});



export default router;
