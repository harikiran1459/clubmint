import { Router } from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2022-11-15",
// });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// router.post("/checkout/create", async (req, res) => {
//   try {
//     const { productIds } = req.body;

//     if (!Array.isArray(productIds) || productIds.length === 0) {
//       return res.status(400).json({ ok: false, error: "No products selected" });
//     }

//     const products = await prisma.product.findMany({
//       where: { id: { in: productIds } },
//     });

//     if (products.length === 0) {
//       return res.status(400).json({ ok: false, error: "Products not found" });
//     }

//     const lineItems = products.map((p) => {
//   if (!p.stripePriceId) {
//     throw new Error(`Product ${p.id} missing stripePriceId`);
//   }

//   return {
//     price: p.stripePriceId,
//     quantity: 1,
//   };
// });


//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       payment_method_types: ["card"],
//       line_items: lineItems,
//       success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
//       metadata: {
//         productIds: productIds.join(","),
//       },
//     });

//     return res.json({ ok: true, url: session.url });
//   } catch (err) {
//     console.error("Checkout create error:", err);
//     return res.status(500).json({ ok: false });
//   }
// });

router.post("/create", requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { creator: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const creator = product.creator;
    

    if (!creator.razorpayAccountId) {
      return res.status(400).json({
        error: "Creator has not connected payouts",
      });
    }

    const amount = product.priceCents * 100; // paise
    const commission = Math.round(
      (amount * creator.commissionPct) / 100
    );
    const creatorAmount = amount - commission;

    const order = await razorpay.orders.create({
  amount,
  currency: "INR",
  receipt: `rcpt_${Date.now()}`,
});
const razorpayOrderId = order.id;
const razorpayPaymentId = null; // set later via webhook
const creatorId = creator.id;

    await prisma.payment.create({
  data: {
    razorpayOrderId,
    razorpayPaymentId,
    amount,
    commission,
    creatorAmount,
    status: "created",
    creatorId,
    productId: product.id,
    userId,
  },
});


    return res.json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id, // ✅ now correctly typed
      amount,
      currency: "INR",
      productTitle: product.title,
    });
  } catch (err) {
    console.error("Checkout create error:", err);
    return res.status(500).json({ error: "Checkout creation failed" });
  }
});


export default router;
