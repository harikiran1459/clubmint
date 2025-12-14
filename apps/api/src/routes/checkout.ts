import { Router } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

router.post("/checkout/create", async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ ok: false, error: "No products selected" });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length === 0) {
      return res.status(400).json({ ok: false, error: "Products not found" });
    }

    const lineItems = products.map((p) => {
  if (!p.stripePriceId) {
    throw new Error(`Product ${p.id} missing stripePriceId`);
  }

  return {
    price: p.stripePriceId,
    quantity: 1,
  };
});


    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        productIds: productIds.join(","),
      },
    });

    return res.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("Checkout create error:", err);
    return res.status(500).json({ ok: false });
  }
});

export default router;
