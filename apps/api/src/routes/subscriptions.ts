import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /subscriptions/by-creator/:creatorId
 * Returns all subscribers for a specific creator
 */
router.get("/by-creator/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;

    const subs = await prisma.subscription.findMany({
      where: {
        product: {
          creatorId: creatorId
        }
      },
      include: {
        user: true,
        product: true
      }
    });

    res.json(subs);
  } catch (err) {
    console.error("Subscription fetch error:", err);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

/**
 * GET /subscriptions/by-user/:userId
 * Returns all product subscriptions for a user
 */
router.get("/by-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const subs = await prisma.subscription.findMany({
      where: { userId },
      include: { user: true, product: true }
    });

    res.json(subs);
  } catch (err) {
    console.error("User subscription fetch error:", err);
    res.status(500).json({ error: "Failed to fetch user subscriptions" });
  }
});

router.get("/creator", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
  });

  if (!creator) {
    return res.status(404).json({ ok: false });
  }

  const subs = await prisma.subscription.findMany({
    where: {
      product: {
        creatorId: creator.id,
      },
    },
    include: {
      user: {
        select: { email: true },
      },
      product: {
        select: { title: true },
      },
      accessControls: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    ok: true,
    subscriptions: subs,
  });
});


export default router;
