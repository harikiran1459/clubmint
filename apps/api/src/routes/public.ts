import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { CLUBMINT_PLANS } from "../config/plans";

const router = Router();
const prisma = new PrismaClient();

/* -------------------------------------------
   CREATOR PUBLIC PAGE
-------------------------------------------- */
router.get("/creator/public/:handle", async (req, res) => {
  try {
    const { handle } = req.params;

    const creator = await prisma.creator.findUnique({
      where: { handle },
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    const product = await prisma.product.findFirst({
      where: { creatorId: creator.id },
    });

    if (!product) {
      return res.status(404).json({ error: "No products found" });
    }

    res.json({ ok: true, creator, product });
  } catch (err) {
    console.error("public creator page error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------------------
   PUBLIC PRICING (SAFE FOR FRONTEND)
-------------------------------------------- */
router.get("/pricing", (_, res) => {
  res.json({
    ok: true,
    plans: {
      free: {
        name: "Free",
        price: 0,
        commissionPct: CLUBMINT_PLANS.free.commissionPct,
        features: [
          "1 paid product",
          "1 Telegram group",
          "15% platform commission",
          "Community support",
        ],
      },
      starter: {
        name: "Starter",
        price: 999,
        commissionPct: CLUBMINT_PLANS.starter.commissionPct,
        highlighted: true,
        features: [
          "Up to 3 products",
          "Up to 3 Telegram groups",
          "5% platform commission",
          "Analytics dashboard",
        ],
      },
      pro: {
        name: "Pro",
        price: 2499,
        commissionPct: CLUBMINT_PLANS.pro.commissionPct,
        features: [
          "Unlimited products",
          "Unlimited Telegram groups",
          "3% platform commission",
          "Priority support",
        ],
      },
    },
  });
});

export default router;
