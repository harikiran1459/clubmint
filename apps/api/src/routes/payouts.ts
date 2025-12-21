import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth,requireAdmin } from "../middleware/auth";
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
// router.post("/connect", requireAuth, async (req, res) => {
//   try {
//     const creator = await prisma.creator.findUnique({
//       where: { userId: req.userId },
//     });

//     if (!creator) {
//       return res.status(404).json({ error: "Creator not found" });
//     }

//     // If already connected, do nothing
//     if (creator.razorpayAccountId) {
//       return res.json({ ok: true, alreadyConnected: true });
//     }

//     /**
//      * 1️⃣ Create Razorpay Route account
//      */
//     const account = (await razorpay.accounts.create({
//       type: "route",
//       email: `${creator.handle}@clubmint.com`,
//       phone: "9999999999", // placeholder, updated during onboarding
//       contact_name: creator.handle,
//       legal_business_name: creator.handle,
//       business_type: "individual",
//       profile: {
//         category: "education",
//         subcategory: "online_courses",
//       },
//     })) as any;

//     /**
//      * 2️⃣ Save account ID
//      */
//     await prisma.creator.update({
//       where: { id: creator.id },
//       data: {
//         razorpayAccountId: account.id,
//         payoutsEnabled: false,
//       },
//     });

//     /**
//      * 3️⃣ Generate onboarding link
//      */
//     const accountLink = await (razorpay as any).request({
//   method: "POST",
//   url: `/v2/accounts/${account.id}/links`,
//   data: {
//     type: "account_onboarding",
//     refresh_url: `${process.env.WEB_BASE_URL}/dashboard/payouts`,
//     return_url: `${process.env.WEB_BASE_URL}/dashboard/payouts`,
//   },
// });


//     return res.json({
//       ok: true,
//       onboardingUrl: accountLink.short_url,
//     });
//   } catch (err) {
//     console.error("❌ Payout connect error:", err);
//     return res.status(500).json({ error: "Failed to connect payouts" });
//   }
// });

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
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId },
    });

    if (!creator) {
      return res.json({ ok: true, payments: [] });
    }

    if (!creator.stripeAccountId) {
      return res.json({
        ok: true,
        payments: [],
        connected: false,
      });
    }

    const payments = await prisma.payment.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { title: true } },
        user: { select: { email: true } },
      },
    });

    return res.json({
      ok: true,
      connected: true,
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
  } catch (err) {
    console.error("❌ GET /payouts/transactions failed", err);
    return res.status(500).json({ ok: false });
  }
});


router.get("/admin/payouts/pending", requireAuth, requireAdmin, async (req, res) => {
  // TODO: add admin check later
  const creators = await prisma.creator.findMany({
  where: {
    earnings: {
      some: { status: "PENDING" },
    },
  },
  include: {
    earnings: {
      where: { status: "PENDING" },
    },
  },
});

const data = creators.map((c) => ({
  creatorId: c.id,
  handle: c.handle,
  totalPending: c.earnings.reduce(
    (sum, e) => sum + e.netAmount,
    0
  ),
  payoutMethod: c.payoutMethod,
  bankName: c.bankName,
  accountNumber: c.accountNumber,
  ifsc: c.ifsc,
  accountHolder: c.accountHolder,
  upiId: c.upiId,
}));

res.json({ ok: true, data });

});

router.post("/admin/payouts/run", requireAuth, requireAdmin, async (req, res) => {
  const { creatorId } = req.body;

  const earnings = await prisma.creatorEarning.findMany({
  where: {
    creatorId,
    status: "PENDING",
  },
  orderBy: {
    createdAt: "asc",
  },
});

if (earnings.length === 0) {
  return res.json({ ok: false, error: "No pending earnings" });
}

const total = earnings.reduce(
  (sum, e) => sum + e.netAmount,
  0
);

const periodStart = earnings[0].createdAt;
const periodEnd = earnings[earnings.length - 1].createdAt;

const existing = await prisma.payout.findFirst({
  where: {
    creatorId,
    status: "COMPLETED",
    periodEnd,
  },
});

if (existing) {
  return res.json({ ok: false, error: "Already paid" });
}

const creator = await prisma.creator.findUnique({
  where: { id: creatorId },
});

if (!creator) {
  return res.status(404).json({ error: "Creator not found" });
}

const hasValidDetails =
  (creator.payoutMethod === "upi" && creator.upiId) ||
  (creator.payoutMethod === "bank" &&
    creator.accountNumber &&
    creator.ifsc &&
    creator.accountHolder);

if (!hasValidDetails) {
  return res.status(400).json({
    error: "Creator payout details incomplete",
  });
}



const payout = await prisma.payout.create({
  data: {
    creator: {
      connect: { id: creatorId },
    },
    totalAmount: total,
    status: "COMPLETED",
    periodStart,
    periodEnd,
    paidAt: new Date(),
  },
});

await prisma.creatorEarning.updateMany({
  where: {
    id: { in: earnings.map(e => e.id) },
  },
  data: {
    status: "PAID",
    payoutId: payout.id,
  },
});

res.json({ ok: true, payoutId: payout.id });

});


router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    // 1️⃣ Always derive creator from user
    const creator = await prisma.creator.findUnique({
      where: { userId },
      select: { id: true },
    });

    // 2️⃣ If creator doesn't exist yet, return empty payouts
    if (!creator) {
      return res.json({
        ok: true,
        payouts: [],
      });
    }

    // 3️⃣ Safe Prisma query (creator.id is guaranteed)
    const payouts = await prisma.payout.findMany({
      where: { creatorId: creator.id },
      orderBy: { paidAt: "desc" },
      select: {
        id: true,
        totalAmount: true,
        paidAt: true,
        periodStart: true,
        periodEnd: true,
        status: true,
      },
    });

    return res.json({ ok: true, payouts });
  } catch (err) {
    console.error("❌ GET /payouts/history failed", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});



export default router;
