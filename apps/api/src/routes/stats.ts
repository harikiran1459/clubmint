// apps/api/src/routes/stats.ts

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/* ------------------------------------------------
   GET /stats/creator/overview
------------------------------------------------- */
router.get("/creator/overview", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;

    const creator = await prisma.creator.findUnique({
      where: { userId },
      include: {
        products: true,
      },
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    /* -----------------------------
       SUBSCRIPTIONS
    ------------------------------ */
    const subscriptions = await prisma.subscription.findMany({
      where: {
        product: { creatorId: creator.id },
        status: "active",
      },
      include: {
        product: true,
      },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    let grossRevenue = 0;
    let activeSubs = subscriptions.length;

    const productRevenueMap: Record<string, number> = {};

    for (const sub of subscriptions) {
      const price = sub.product.priceCents / 100;
      grossRevenue += price;

      productRevenueMap[sub.product.title] =
        (productRevenueMap[sub.product.title] || 0) + price;
    }

    const commissionPaid =
      (grossRevenue * creator.commissionPct) / 100;

    const netRevenue = grossRevenue - commissionPaid;

    const topProductEntry = Object.entries(productRevenueMap).sort(
      (a, b) => b[1] - a[1]
    )[0];

    /* -----------------------------
       CHURN & GROWTH
    ------------------------------ */
    const newSubsThisWeek = await prisma.subscription.count({
      where: {
        product: { creatorId: creator.id },
        createdAt: { gte: startOfWeek },
      },
    });

    const churnedThisMonth = await prisma.subscription.count({
      where: {
        product: { creatorId: creator.id },
        status: "canceled",
        updatedAt: { gte: startOfMonth },
      },
    });

    /* -----------------------------
       TELEGRAM AUTOMATION
    ------------------------------ */
    const pendingAccess = await prisma.accessControl.count({
      where: {
        subscription: {
          product: { creatorId: creator.id },
        },
        status: "pending",
      },
    });

    const telegramGroups = await prisma.telegramGroup.count({
      where: {
        creatorId: creator.id,
        isConnected: true,
      },
    });

    const telegramStatus =
      telegramGroups === 0
        ? "error"
        : pendingAccess > 0
        ? "warning"
        : "ok";
if (!creator) {
  return res.json({
    ok: true,
    revenue: { netThisMonth: 0, mrr: 0, commissionPaid: 0 },
    subscribers: { active: 0, newThisWeek: 0, churnedThisMonth: 0 },
    products: { topProduct: null },
    automation: { telegramStatus: "error", pendingActions: 0 },
  });
}

    /* -----------------------------
       RESPONSE
    ------------------------------ */
    return res.json({
      revenue: {
        netThisMonth: Math.round(netRevenue),
        mrr: Math.round(grossRevenue),
        commissionPaid: Math.round(commissionPaid),
      },
      subscribers: {
        active: activeSubs,
        newThisWeek: newSubsThisWeek,
        churnedThisMonth,
      },
      products: {
        topProduct: topProductEntry
          ? {
              name: topProductEntry[0],
              revenue: Math.round(topProductEntry[1]),
            }
          : null,
      },
      automation: {
        telegramStatus,
        pendingActions: pendingAccess,
      },
    });
  } catch (err) {
    console.error("Creator overview stats error:", err);
    return res.status(500).json({ error: "Failed to load stats" });
  }
});


// GET /stats/creator/subscribers
router.get("/creator/subscribers", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
  });

  if (!creator) {
  return res.json({ ok: true, subscribers: [] });
}


  const subs = await prisma.subscription.findMany({
    where: {
      product: {
        creatorId: creator.id,
      },
    },
    include: {
      user: {
        select: {
          email: true,
          createdAt: true,
        },
      },
      product: {
        select: {
          title: true,
          priceCents: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    ok: true,
    subscribers: subs.map((s) => ({
      id: s.id,
      email: s.user.email,
      product: s.product.title,
      amount: s.product.priceCents / 100,
      status: s.status,
      joinedAt: s.createdAt,
    })),
  });
});


// GET /stats/creator/automation-health
router.get("/creator/automation-health", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
  });

  if (!creator) {
  return res.json({
    ok: true,
    metrics: {
      totalActions: 0,
      failures: 0,
      healthy: true,
      lastEventAt: null,
    },
  });
}


  const logs = await prisma.telegramActivityLog.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const failed = logs.filter(
    (l) => l.event.includes("fail") || l.reason
  ).length;

  res.json({
    ok: true,
    metrics: {
      totalActions: logs.length,
      failures: failed,
      healthy: failed === 0,
      lastEventAt: logs[0]?.createdAt ?? null,
    },
  });
});

router.get("/creator/earnings", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
  });

  if (!creator) {
    return res.json({
      ok: true,
      totalRevenue: 0,
      totalCommission: 0,
      netEarnings: 0,
      transactions: 0,
    });
  }

  const payments = await prisma.payment.findMany({
    where: {
      creatorId: creator.id,
      status: "paid",
    },
  });

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalCommission = payments.reduce((s, p) => s + p.commission, 0);
  const netEarnings = payments.reduce((s, p) => s + p.creatorAmount, 0);

  res.json({
    ok: true,
    totalRevenue,
    totalCommission,
    netEarnings,
    transactions: payments.length,
  });
});



export default router;
