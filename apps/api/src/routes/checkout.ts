import { Router } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";
import { requireAuth } from "../middleware/auth";
import { publicLimiter } from "../middleware/rateLimit";

const router = Router();
const prisma = new PrismaClient();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2022-11-15",
// });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

router.post("/create",publicLimiter, async (req, res) => {
  try {
    const { productIds } = req.body;

    // ------------------------------------------------
    // Validate input
    // ------------------------------------------------
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "No products selected",
      });
    }

    // ------------------------------------------------
    // Load products
    // ------------------------------------------------
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        creator: true,
      },
    });

    if (products.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Products not found",
      });
    }

    // ------------------------------------------------
    // Ensure all products belong to SAME creator
    // ------------------------------------------------
    const creator = products[0].creator;

    const mixedCreators = products.some(
      (p) => p.creatorId !== creator.id
    );

    if (mixedCreators) {
      return res.status(400).json({
        ok: false,
        error: "Products must belong to the same creator",
      });
    }

    // ------------------------------------------------
    // Calculate totals (IN PAISE)
    // ------------------------------------------------
    const amount = products.reduce(
      (sum, p) => sum + p.priceCents,
      0
    );

    const commission = Math.round(
      (amount * creator.commissionPct) / 100
    );

    const creatorAmount = amount - commission;

    // ------------------------------------------------
    // Create Razorpay order
    // ------------------------------------------------
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // ------------------------------------------------
    // Record payment rows (one per product)
    // ------------------------------------------------
    await prisma.payment.createMany({
      data: products.map((p) => ({
        razorpayOrderId: order.id,
        razorpayPaymentId: null,
        amount: p.priceCents,
        commission: Math.round(
          (p.priceCents * 100 * creator.commissionPct) / 100
        ),
        creatorAmount:
          p.priceCents * 100 -
          Math.round(
            (p.priceCents * 100 * creator.commissionPct) / 100
          ),
        status: "created",
        creatorId: creator.id,
        productId: p.id,
        userId: null, // 👈 PUBLIC CHECKOUT
      })),
    });

    // ------------------------------------------------
    // Response to frontend
    // ------------------------------------------------
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
