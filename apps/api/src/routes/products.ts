import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";
import Stripe from "stripe";
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
    });

    if (!creator) {
      return res.status(400).json({
        ok: false,
        error: "Creator not found",
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


export default router;
