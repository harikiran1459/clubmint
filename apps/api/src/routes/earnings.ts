import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /creator/earnings
 * Returns creator earnings summary + payouts
 */
router.get("/earnings", requireAuth, async (req, res) => {
  const userId = req.userId;

  const creator = await prisma.creator.findUnique({
    where: { userId },
  });

  if (!creator) {
    return res.status(404).json({ ok: false });
  }

  const pending = await prisma.creatorEarning.aggregate({
    where: {
      creatorId: creator.id,
      status: "PENDING",
    },
    _sum: {
      netAmount: true,
    },
  });

  const lastPayout = await prisma.payout.findFirst({
    where: {
      creatorId: creator.id,
      status: "COMPLETED",
    },
    orderBy: {
      paidAt: "desc",
    },
  });

  const payouts = await prisma.payout.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return res.json({
    ok: true,
    balance: pending._sum.netAmount || 0,
    lastPayout,
    payouts,
  });
});

export default router;
