import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";
import Stripe from "stripe";
import { CLUBMINT_PLANS } from "../config/plans";
import { PLAN_LIMITS } from "../config/planLimits";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});


const prisma = new PrismaClient();
const router = Router();

/**
 * GET /products
 * Get all products for logged-in creator
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return res.json({ ok: true, products: [] });
    }

    const products = await prisma.product.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ ok: true, products });
  } catch (err) {
    console.error("GET /products error:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * POST /products
 * Create product for logged-in creator
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, priceCents, billingInterval } = req.body;

    if (!title || !priceCents) {
      return res.status(400).json({
        ok: false,
        error: "Missing title or price",
      });
    }

    const creator = await prisma.creator.findUnique({
  where: { userId },
  include: { products: true },
});


    if (!creator) {
      return res.status(400).json({
        ok: false,
        error: "Creator not found",
      });
    }
    const planConfig = CLUBMINT_PLANS[creator.plan];
const maxProducts = planConfig.features.products;

if (
  Number.isFinite(maxProducts) &&
  creator.products.length >= maxProducts
) {
  return res.status(403).json({
    ok: false,
    error: `Your ${planConfig.name} plan allows only ${maxProducts} products. Upgrade to add more.`,
  });
}


    const product = await prisma.product.create({
      data: {
        creatorId: creator.id,
        title,
        description,
        priceCents,
        billingInterval,
      },
    });
    const stripeProduct = await stripe.products.create({
  name: title,
  description: description ?? undefined,
});
const stripePrice = await stripe.prices.create({
  product: stripeProduct.id,
  currency: "usd",
  unit_amount: priceCents,
  recurring: {
    interval: billingInterval === "year" ? "year" : "month",
  },
});
await prisma.product.update({
  where: { id: product.id },
  data: {
    stripePriceId: stripePrice.id,
  },
});


    return res.json({ ok: true, product });
  } catch (err) {
    console.error("POST /products error:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * DELETE /products/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator)
      return res.status(400).json({ ok: false, error: "Creator not found" });

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product || product.creatorId !== creator.id) {
      return res.status(403).json({ ok: false, error: "Not allowed" });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /products/:id error:", err);
    return res.status(500).json({ ok: false });
  }
});


// POST /products/by-ids
router.post("/by-ids", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ ok: true, products: [] });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
    });

    return res.json({ ok: true, products });
  } catch (err) {
    console.error("POST /products/by-ids error:", err);
    return res.status(500).json({ ok: false });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      creator: { userId: req.userId },
    },
    include: {
      telegramGroups: true,
    },
  });

  if (!product) {
    return res.status(404).json({ ok: false });
  }

  res.json({ ok: true, product });
});

/**
 * GET /products/:id/available-groups
 * Get all Telegram groups for the product's creator
 */
router.get("/:id/available-groups", requireAuth, async (req, res) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      creator: { userId: req.userId },
    },
    select: {
      creatorId: true,
    },
  });

  if (!product) {
    return res.status(404).json({ ok: false });
  }

  const groups = await prisma.telegramGroup.findMany({
    where: {
      creatorId: product.creatorId,
      isConnected: true,
    },
    orderBy: { createdAt: "asc" },
  });

  res.json({ ok: true, groups });
});


/**
 * POST /products/:id/access
 * Update Telegram group access for a product
 */
router.post("/:id/access", requireAuth, async (req, res) => {
  const { groupIds } = req.body;

  if (!Array.isArray(groupIds)) {
    return res.status(400).json({ ok: false });
  }

  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      creator: { userId: req.userId },
    },
  });

  if (!product) {
    return res.status(404).json({ ok: false });
  }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      telegramGroups: {
        set: groupIds.map((id: string) => ({ id })),
      },
    },
  });

  res.json({ ok: true });
});



export default router;
