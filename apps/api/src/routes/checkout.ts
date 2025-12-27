import { Router } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";
import { requireAuth } from "../middleware/auth";
import { publicLimiter } from "../middleware/rateLimit";
import { trackEvent } from "../utils/trackEvent";
import { ANALYTICS_EVENTS } from "../analytics/events";


const router = Router();
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

router.post("/create", publicLimiter, async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "No products selected",
      });
    }

    // Load products + creator
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { creator: true },
    });

    if (products.length === 0) {
      return res.status(404).json({ ok: false, error: "Products not found" });
    }

    const creator = products[0].creator;

    // Ensure same creator
    if (products.some((p) => p.creatorId !== creator.id)) {
      return res.status(400).json({
        ok: false,
        error: "Products must belong to same creator",
      });
    }

    // 💰 Amount calculation (PAISE ONLY)
    const amount = products.reduce(
      (sum, p) => sum + p.priceCents,
      0
    );

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // Analytics: checkout start
    await trackEvent({
      creatorId: creator.id,
      sessionId:
        (req.headers["x-session-id"] as string) ?? order.id,
      event: ANALYTICS_EVENTS.CHECKOUT_START,
      entityType: "creator",
      entityId: creator.id,
      metadata: {
        productIds,
        totalAmount: amount,
        currency: "INR",
        provider: "razorpay",
      },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await prisma.payment.createMany({
  data: products.map((p) => ({
    razorpayOrderId: order.id,
    razorpayPaymentId: null,

    // 🔐 ALWAYS paise
    amount: p.priceCents,

    // ⚠️ placeholders — real money calculated in webhook
    commission: 0,
    creatorAmount: 0,

    status: "created",
    creatorId: creator.id,
    productId: p.id,
    userId: null, // public checkout
  })),
});


    return res.json({
      ok: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount,
      currency: "INR",
      productTitles: products.map((p) => p.title),
      creatorHandle: creator.handle,
    });
  } catch (err) {
    console.error("Checkout create error:", err);
    return res.status(500).json({
      ok: false,
      error: "Checkout creation failed",
    });
  }
});


export default router;
