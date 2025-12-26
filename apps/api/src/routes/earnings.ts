import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /earnings
 * Creator earnings summary + payout history
 */
router.get("/earnings", requireAuth, async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId },
    });

    // If creator doesn't exist yet → return empty state
    if (!creator) {
      return res.json({
        ok: true,
        balance: 0,
        lastPayout: null,
        payouts: [],
      });
    }

    // Available (pending) balance
    const pending = await prisma.creatorEarning.aggregate({
      where: {
        creatorId: creator.id,
        status: "PENDING",
      },
      _sum: { netAmount: true },
    });

    // Most recent completed payout
    const lastPayout = await prisma.payout.findFirst({
      where: {
        creatorId: creator.id,
        status: "COMPLETED",
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    // Payout history (recent)
    const payouts = await prisma.payout.findMany({
      where: { creatorId: creator.id },
      orderBy: {
        paidAt: "desc",
      },
      take: 10,
    });

    return res.json({
      ok: true,
      balance: pending._sum.netAmount ?? 0,
      lastPayout,
      payouts,
    });
  } catch (err) {
    console.error("❌ GET /earnings failed", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to load earnings",
    });
  }
});

export default router;
