import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /subscribers
 * Creator: list all subscribers
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const creatorId = (req as any).creatorId;

    if (!creatorId) {
      return res.status(403).json({ ok: false });
    }

    const access = await prisma.accessControl.findMany({
      where: {
        subscription: {
          product: {
            creatorId,
          },
        },
      },
      include: {
        subscription: {
          include: {
            user: true,
            product: true,
          },
        },
      },
      orderBy: {
        grantedAt: "desc",
      },
    });

    const rows = access.map((a) => ({
      id: a.id,
      email: a.subscription.user.email,
      productTitle: a.subscription.product?.title,
      platform: a.platform,
      status: a.status,
      grantedAt: a.grantedAt,
      currentPeriodEnd: a.subscription.currentPeriodEnd,
      kickAfter: a.subscription.kickAfter,
    }));

    res.json({ ok: true, subscribers: rows });
  } catch (err) {
    console.error("GET /subscribers error:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;
