import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /me/access
 * Buyer access list
 */
router.get("/access", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ ok: false });
    }

    const access = await prisma.accessControl.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      include: {
        subscription: {
          include: {
            product: {
              include: {
                creator: true,
              },
            },
          },
        },
      },
      orderBy: {
        grantedAt: "desc", // ✅ correct field
      },
    });

    const formatted = access.map((a) => {
  const sub = a.subscription;

  return {
    id: a.id,
    productTitle: sub.product?.title,
    creatorHandle: sub.product?.creator.handle,
    platform: a.platform,
    status: a.status,

    // lifecycle (REAL fields)
    grantedAt: a.grantedAt,
    currentPeriodEnd: sub.currentPeriodEnd,
    kickAfter: sub.kickAfter,

    inviteUrl:
      a.status === "active"
        ? (a.metadata as any)?.inviteUrl || null
        : null,
  };
});



    return res.json({
      ok: true,
      access: formatted,
    });
  } catch (err) {
    console.error("GET /me/access error:", err);
    return res.status(500).json({ ok: false });
  }
});

router.get("/creator-status", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
    select: { id: true },
  });

  res.json({
    ok: true,
    isCreator: Boolean(creator),
  });
});


export default router;
