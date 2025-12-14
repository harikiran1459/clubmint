import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get creator
    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return res.json({
        ok: false,
        error: "Creator not found",
        stats: {
          subscriberCount: 0,
          monthlyRevenue: 0,
          telegramLinked: false,
        },
      });
    }

    // Count active subscribers
    const subscriberCount = await prisma.subscription.count({
      where: {
        product: { creatorId: creator.id },
        status: "active",
      },
    });

    // Sum revenue
    const revenueData = await prisma.subscription.findMany({
      where: {
        product: { creatorId: creator.id },
        status: "active",
      },
      include: { product: true },
    });

    const monthlyRevenue = revenueData.reduce(
      (sum, sub) => sum + (sub.product.priceCents || 0),
      0
    );

    // Telegram linked?
    const telegramLinked =
      (await prisma.telegramUser.findFirst({
        where: { userId },
      })) !== null;

    return res.json({
      ok: true,
      stats: {
        subscriberCount,
        monthlyRevenue,
        telegramLinked,
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});


router.get("/creator/dashboard", auth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    const product = await prisma.product.findFirst({
      where: { creatorId: creator.id },
    });

    const subscriberCount = await prisma.subscription.count({
      where: {
        productId: product?.id,
        status: "active",
      },
    });

    const monthlyRevenue = product ? product.priceCents * subscriberCount : 0;

    const telegram = await prisma.integrationSettings.findFirst({
      where: { creatorId: creator.id, platform: "telegram" },
    });

    res.json({
      creator,
      product,
      stats: {
        subscriberCount,
        monthlyRevenue,
        telegramLinked: !!telegram,
      },
    });
  } catch (err) {
    console.error("dashboard error", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
