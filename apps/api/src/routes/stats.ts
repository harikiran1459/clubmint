import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/dashboard/stats/:creatorId", requireAuth, async (req, res) => {
  try {
    const { creatorId } = req.params;

    // ---------------------------------------------------
    // 1. Get all products owned by this creator
    // ---------------------------------------------------
    const products = await prisma.product.findMany({
      where: { creatorId },
      select: { id: true }
    });

    const productIds = products.map(p => p.id);

    // No products → return empty stats
    if (productIds.length === 0) {
      return res.json({
        ok: true,
        subscriberCount: 0,
        monthlyRevenue: 0,
        revenueGraph: [],
        subscriberGraph: [],
        telegramLinked: false
      });
    }

    // ---------------------------------------------------
    // 2. Count subscribers to these products
    // ---------------------------------------------------
    const subscriberCount = await prisma.subscription.count({
      where: {
        productId: { in: productIds },
        status: "active"
      }
    });

    // ---------------------------------------------------
    // 3. Revenue does NOT exist → simulate revenue using priceCents
    // ---------------------------------------------------
    const activeSubs = await prisma.subscription.findMany({
      where: {
        productId: { in: productIds },
        status: "active"
      },
      include: {
        product: true
      }
    });

    const monthlyRevenue = activeSubs.reduce((sum, sub) => {
      return sum + sub.product.priceCents;
    }, 0);

    // ---------------------------------------------------
    // 4. Subscriber Graph (last 30 days)
    // ---------------------------------------------------
    const subsLast30 = await prisma.subscription.findMany({
      where: {
        productId: { in: productIds },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true }
    });

    const subscriberMap: any = {};

    subsLast30.forEach(s => {
      const date = s.createdAt.toISOString().slice(0, 10);
      subscriberMap[date] = (subscriberMap[date] || 0) + 1;
    });

    const subscriberGraph = Object.entries(subscriberMap).map(([date, count]) => ({
      date,
      count
    }));

    // ---------------------------------------------------
    // 5. Telegram Linked (via creator.telegramGroups)
    // ---------------------------------------------------
    const telegramGroups = await prisma.telegramGroup.findMany({
      where: { creatorId }
    });

    const telegramLinked = telegramGroups.length > 0;

    // ---------------------------------------------------
    // RETURN FINAL STATS
    // ---------------------------------------------------
    return res.json({
      ok: true,
      subscriberCount,
      monthlyRevenue,
      revenueGraph: [], // skip, no payment model
      subscriberGraph,
      telegramLinked
    });

  } catch (err: any) {
    console.error("Stats API error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;