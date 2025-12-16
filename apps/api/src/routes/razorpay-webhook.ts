import { Router } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { CLUBMINT_PLANS } from "../config/plans";

const router = Router();
const prisma = new PrismaClient();

router.post("/razorpay", async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const receivedSignature = req.headers["x-razorpay-signature"];

  if (expectedSignature !== receivedSignature) {
    console.error("❌ Invalid Razorpay webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;
  const payload = req.body.payload;

  /* -------------------------------------------
     SUBSCRIPTION ACTIVATED / CHARGED
  ------------------------------------------- */
  if (
    event === "subscription.activated" ||
    event === "subscription.charged"
  ) {
    const sub = payload.subscription.entity;

    const creator = await prisma.creator.findFirst({
      where: { razorpaySubId: sub.id },
    });

    if (!creator) return res.sendStatus(200);

    const planEntry = Object.entries(CLUBMINT_PLANS).find(
      ([_, v]) => v.razorpayPlanId === sub.plan_id
    );

    if (!planEntry) {
      console.error("⚠️ Unknown Razorpay plan ID:", sub.plan_id);
      return res.sendStatus(200);
    }

    const [planKey, planConfig] = planEntry;

    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        plan: planKey as any,
        commissionPct: planConfig.commissionPct,
        planStartedAt: new Date(),
        planExpiresAt: null,
      },
    });
  }

  /* -------------------------------------------
     SUBSCRIPTION CANCELLED / EXPIRED
  ------------------------------------------- */
  if (
    event === "subscription.cancelled" ||
    event === "subscription.completed" ||
    event === "subscription.halted"
  ) {
    const sub = payload.subscription.entity;

    await prisma.creator.updateMany({
      where: { razorpaySubId: sub.id },
      data: {
        plan: "free",
        commissionPct: CLUBMINT_PLANS.free.commissionPct,
        razorpaySubId: null,
        planExpiresAt: new Date(),
      },
    });
  }

  res.sendStatus(200);
});

export default router;
