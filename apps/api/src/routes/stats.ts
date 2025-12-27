// apps/api/src/routes/stats.ts

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/* =========================================================
   NEW ANALYTICS-BASED DASHBOARD APIS (FAST, AGGREGATED)
   ========================================================= */

/**
 * GET /stats/overview
 * Uses AnalyticsDaily (creator dashboard cards)
 */
router.get("/overview", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;

    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return res.json({
        ok: true,
        data: {
          pageViews: 0,
          uniqueVisitors: 0,
          conversionRate: 0,
          revenue: 0,
        },
      });
    }

    const rows = await prisma.analyticsDaily.findMany({
      where: { creatorId: creator.id },
    });

    let pageViews = 0;
    let uniqueVisitors = 0;
    let checkoutStarts = 0;
    let paymentsSuccess = 0;
    let revenue = 0;

    for (const r of rows) {
      pageViews += r.pageViews;
      uniqueVisitors += r.uniqueVisitors;
      checkoutStarts += r.checkoutStarts;
      paymentsSuccess += r.paymentsSuccess;
      revenue += r.revenue;
    }

    const conversionRate =
      checkoutStarts > 0
        ? Number(((paymentsSuccess / checkoutStarts) * 100).toFixed(2))
        : 0;

    res.json({
      ok: true,
      data: {
        pageViews,
        uniqueVisitors,
        conversionRate,
        revenue, // paise
      },
    });
  } catch (err) {
    console.error("Stats overview error:", err);
    res.status(500).json({ ok: false });
  }
});


/* =========================================================
   FUNNEL BREAKDOWN (VIEW → CHECKOUT → PAYMENT)
   ========================================================= */

/**
 * GET /stats/funnel?days=30
 * Conversion funnel for creator
 */
router.get("/funnel", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const days = Number(req.query.days ?? 30);

    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return res.json({
        ok: true,
        data: {
          pageViews: 0,
          checkoutStarts: 0,
          paymentsSuccess: 0,
          viewToCheckoutRate: 0,
          checkoutToPaymentRate: 0,
          overallConversionRate: 0,
        },
      });
    }

    const from = new Date();
    from.setDate(from.getDate() - days);

    const rows = await prisma.analyticsDaily.findMany({
      where: {
        creatorId: creator.id,
        date: { gte: from },
      },
    });

    let pageViews = 0;
    let checkoutStarts = 0;
    let paymentsSuccess = 0;

    for (const r of rows) {
      pageViews += r.pageViews;
      checkoutStarts += r.checkoutStarts;
      paymentsSuccess += r.paymentsSuccess;
    }

    const viewToCheckoutRate =
      pageViews > 0
        ? Number(((checkoutStarts / pageViews) * 100).toFixed(2))
        : 0;

    const checkoutToPaymentRate =
      checkoutStarts > 0
        ? Number(((paymentsSuccess / checkoutStarts) * 100).toFixed(2))
        : 0;

    const overallConversionRate =
      pageViews > 0
        ? Number(((paymentsSuccess / pageViews) * 100).toFixed(2))
        : 0;

    res.json({
      ok: true,
      data: {
        pageViews,
        checkoutStarts,
        paymentsSuccess,
        viewToCheckoutRate,
        checkoutToPaymentRate,
        overallConversionRate,
      },
    });
  } catch (err) {
    console.error("Stats funnel error:", err);
    res.status(500).json({ ok: false });
  }
});

/* =========================================================
   PAGE-LEVEL FUNNEL (PER SALES PAGE)
   ========================================================= */

/**
 * GET /stats/page-funnel?pageId=xxx&days=30
 * Funnel attribution: page_view → checkout_start → payment_success
 */
router.get("/page-funnel", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const pageId = req.query.pageId as string;
    const days = Number(req.query.days ?? 30);

    if (!pageId) {
      return res.status(400).json({
        ok: false,
        error: "pageId is required",
      });
    }

    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return res.json({
        ok: true,
        data: {
          pageViews: 0,
          checkoutStarts: 0,
          paymentsSuccess: 0,
          viewToCheckoutRate: 0,
          checkoutToPaymentRate: 0,
          overallConversionRate: 0,
        },
      });
    }

    const from = new Date();
    from.setDate(from.getDate() - days);

    /**
     * 1️⃣ Page views (page-scoped)
     */
    const pageViews = await prisma.analyticsEvent.count({
      where: {
        creatorId: creator.id,
        event: "page_view",
        entityType: "page",
        entityId: pageId,
        createdAt: { gte: from },
      },
    });

    /**
     * 2️⃣ Sessions that viewed this page
     */
    const pageSessions = await prisma.analyticsEvent.findMany({
      where: {
        creatorId: creator.id,
        event: "page_view",
        entityType: "page",
        entityId: pageId,
        createdAt: { gte: from },
      },
      select: { sessionId: true },
      distinct: ["sessionId"],
    });

    const sessionIds = pageSessions.map((s) => s.sessionId);

    if (sessionIds.length === 0) {
      return res.json({
        ok: true,
        data: {
          pageViews: 0,
          checkoutStarts: 0,
          paymentsSuccess: 0,
          viewToCheckoutRate: 0,
          checkoutToPaymentRate: 0,
          overallConversionRate: 0,
        },
      });
    }

    /**
     * 3️⃣ Checkout starts from those sessions
     */
    const checkoutStarts = await prisma.analyticsEvent.count({
      where: {
        creatorId: creator.id,
        event: "checkout_start",
        sessionId: { in: sessionIds },
        createdAt: { gte: from },
      },
    });

    /**
     * 4️⃣ Payments from those sessions
     */
    const paymentsSuccess = await prisma.analyticsEvent.count({
      where: {
        creatorId: creator.id,
        event: "payment_success",
        sessionId: { in: sessionIds },
        createdAt: { gte: from },
      },
    });

    const viewToCheckoutRate =
      pageViews > 0
        ? Number(((checkoutStarts / pageViews) * 100).toFixed(2))
        : 0;

    const checkoutToPaymentRate =
      checkoutStarts > 0
        ? Number(((paymentsSuccess / checkoutStarts) * 100).toFixed(2))
        : 0;

    const overallConversionRate =
      pageViews > 0
        ? Number(((paymentsSuccess / pageViews) * 100).toFixed(2))
        : 0;

    res.json({
      ok: true,
      data: {
        pageViews,
        checkoutStarts,
        paymentsSuccess,
        viewToCheckoutRate,
        checkoutToPaymentRate,
        overallConversionRate,
      },
    });
  } catch (err) {
    console.error("Stats page funnel error:", err);
    res.status(500).json({ ok: false });
  }
});

/* =========================================================
   PAGE → PRODUCT FUNNEL
   ========================================================= */

/**
 * GET /stats/page-product-funnel?pageId=xxx&days=30
 * Shows which products convert from a given page
 */
router.get("/page-product-funnel", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const pageId = req.query.pageId as string;
    const days = Number(req.query.days ?? 30);

    if (!pageId) {
      return res.status(400).json({
        ok: false,
        error: "pageId is required",
      });
    }

    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return res.json({ ok: true, data: [] });
    }

    const from = new Date();
    from.setDate(from.getDate() - days);

    /**
     * 1️⃣ Sessions that viewed this page
     */
    const pageSessions = await prisma.analyticsEvent.findMany({
      where: {
        creatorId: creator.id,
        event: "page_view",
        entityType: "page",
        entityId: pageId,
        createdAt: { gte: from },
      },
      select: { sessionId: true },
      distinct: ["sessionId"],
    });

    const sessionIds = pageSessions.map((s) => s.sessionId);

    if (sessionIds.length === 0) {
      return res.json({ ok: true, data: [] });
    }

    /**
     * 2️⃣ Checkout starts from those sessions
     */
    const checkouts = await prisma.analyticsEvent.findMany({
      where: {
        creatorId: creator.id,
        event: "checkout_start",
        sessionId: { in: sessionIds },
        createdAt: { gte: from },
      },
      select: {
        sessionId: true,
        metadata: true, // contains productIds[]
      },
    });

    /**
     * 3️⃣ Successful payments (product-level)
     */
    const payments = await prisma.analyticsEvent.findMany({
      where: {
        creatorId: creator.id,
        event: "payment_success",
        sessionId: { in: sessionIds },
        createdAt: { gte: from },
      },
      select: {
        entityId: true, // paymentId
        metadata: true, // may contain subscriptionId / productId
      },
    });

    /**
     * 4️⃣ Build product funnel map
     */
    const productStats: Record<
      string,
      { checkoutStarts: number; payments: number }
    > = {};

    // From checkout_start → product intent
    for (const c of checkouts) {
      const productIds: string[] = (c.metadata as any)?.productIds ?? [];
      for (const pid of productIds) {
        productStats[pid] ??= { checkoutStarts: 0, payments: 0 };
        productStats[pid].checkoutStarts++;
      }
    }

    // From payment_success → actual conversions
    for (const p of payments) {
      const productId = (p.metadata as any)?.productId;
      if (!productId) continue;

      productStats[productId] ??= { checkoutStarts: 0, payments: 0 };
      productStats[productId].payments++;
    }

    /**
     * 5️⃣ Fetch product titles
     */
    const products = await prisma.product.findMany({
      where: {
        id: { in: Object.keys(productStats) },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const titleMap = Object.fromEntries(
      products.map((p) => [p.id, p.title])
    );

    /**
     * 6️⃣ Final response
     */
    res.json({
      ok: true,
      data: Object.entries(productStats).map(([productId, stats]) => ({
        productId,
        title: titleMap[productId] ?? "Unknown",
        checkoutStarts: stats.checkoutStarts,
        payments: stats.payments,
        conversionRate:
          stats.checkoutStarts > 0
            ? Number(
                ((stats.payments / stats.checkoutStarts) * 100).toFixed(2)
              )
            : 0,
      })),
    });
  } catch (err) {
    console.error("Stats page-product funnel error:", err);
    res.status(500).json({ ok: false });
  }
});


/**
 * GET /stats/timeseries?days=30
 * Line charts (revenue, views, conversions)
 */
router.get("/timeseries", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const days = Number(req.query.days ?? 30);

    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return res.json({ ok: true, data: [] });
    }

    const from = new Date();
    from.setDate(from.getDate() - days);

    const rows = await prisma.analyticsDaily.findMany({
      where: {
        creatorId: creator.id,
        date: { gte: from },
      },
      orderBy: { date: "asc" },
    });

    res.json({
      ok: true,
      data: rows.map((r) => ({
        date: r.date,
        pageViews: r.pageViews,
        checkoutStarts: r.checkoutStarts,
        paymentsSuccess: r.paymentsSuccess,
        revenue: r.revenue,
      })),
    });
  } catch (err) {
    console.error("Stats timeseries error:", err);
    res.status(500).json({ ok: false });
  }
});

/**
 * GET /stats/products
 * Exact revenue per product (from Payment table)
 */
router.get("/products", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;

    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return res.json({ ok: true, data: [] });
    }

    const payments = await prisma.payment.groupBy({
      by: ["productId"],
      where: {
        creatorId: creator.id,
        status: "paid",
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    const products = await prisma.product.findMany({
      where: {
        id: { in: payments.map((p) => p.productId) },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const productMap = Object.fromEntries(
      products.map((p) => [p.id, p.title])
    );

    res.json({
      ok: true,
      data: payments.map((p) => ({
        productId: p.productId,
        title: productMap[p.productId] ?? "Unknown",
        revenue: p._sum.amount ?? 0, // paise
        sales: p._count._all,
      })),
    });
  } catch (err) {
    console.error("Stats products error:", err);
    res.status(500).json({ ok: false });
  }
});

/* =========================================================
   EXISTING CREATOR STATS (UNCHANGED – BACKWARD COMPATIBLE)
   ========================================================= */

/* ------------------------------------------------
   GET /stats/creator/overview
------------------------------------------------- */
router.get("/creator/overview", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;

    const creator = await prisma.creator.findUnique({
      where: { userId },
      include: { products: true },
    });

    if (!creator) {
      return res.json({
        revenue: { netThisMonth: 0, mrr: 0, commissionPaid: 0 },
        subscribers: { active: 0, newThisWeek: 0, churnedThisMonth: 0 },
        products: { topProduct: null },
        automation: { telegramStatus: "error", pendingActions: 0 },
      });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        product: { creatorId: creator.id },
        status: "active",
      },
      include: { product: true },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    let grossRevenue = 0;
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

    res.json({
      revenue: {
        netThisMonth: Math.round(netRevenue),
        mrr: Math.round(grossRevenue),
        commissionPaid: Math.round(commissionPaid),
      },
      subscribers: {
        active: subscriptions.length,
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
    res.status(500).json({ error: "Failed to load stats" });
  }
});

/* ------------------------------------------------
   GET /stats/creator/subscribers
------------------------------------------------- */
router.get("/creator/subscribers", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
  });

  if (!creator) {
    return res.json({ ok: true, subscribers: [] });
  }

  const subs = await prisma.subscription.findMany({
    where: {
      product: { creatorId: creator.id },
    },
    include: {
      user: { select: { email: true, createdAt: true } },
      product: { select: { title: true, priceCents: true } },
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

/* ------------------------------------------------
   GET /stats/creator/automation-health
------------------------------------------------- */
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

/* ------------------------------------------------
   GET /stats/creator/earnings
------------------------------------------------- */
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

  const agg = await prisma.creatorEarning.aggregate({
    where: {
      creatorId: creator.id,
      status: "PENDING", // or PAID+PENDING depending on definition
    },
    _sum: {
      grossAmount: true,
      platformFee: true,
      netAmount: true,
    },
    _count: {
      _all: true,
    },
  });

  res.json({
    ok: true,
    totalRevenue: agg._sum.grossAmount ?? 0,
    totalCommission: agg._sum.platformFee ?? 0,
    netEarnings: agg._sum.netAmount ?? 0,
    transactions: agg._count._all ?? 0,
  });
});


export default router;
