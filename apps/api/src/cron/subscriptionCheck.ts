// apps/api/src/cron/subscriptionCheck.ts

import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { sendTelegramMessage } from "../lib/telegram";

const prisma = new PrismaClient();

// ----------------------------------------------------
// Redis + Queue (optional but recommended)
// ----------------------------------------------------
let revokeQueue: Queue | null = null;

if (process.env.REDIS_URL) {
  const connection = new IORedis(process.env.REDIS_URL);
  revokeQueue = new Queue("revoke-access", { connection });
}

// ----------------------------------------------------
// CONFIG
// ----------------------------------------------------
const WARNING_BEFORE_EXPIRY_HOURS = 24;
const GRACE_PERIOD_HOURS = 12;

// ----------------------------------------------------
// CRON — runs every 10 minutes
// ----------------------------------------------------
cron.schedule("*/10 * * * *", async () => {
  console.log("⏳ Running subscription expiry cron…");

  const now = new Date();

  // ====================================================
  // 1️⃣ Warn users 24h before expiry
  // ====================================================
  const warnWindowStart = new Date(
    now.getTime() + (WARNING_BEFORE_EXPIRY_HOURS - 1) * 3600 * 1000
  );
  const warnWindowEnd = new Date(
    now.getTime() + (WARNING_BEFORE_EXPIRY_HOURS + 1) * 3600 * 1000
  );

  const expiringSoon = await prisma.subscription.findMany({
    where: {
      status: "active",
      warned24h: false,
      currentPeriodEnd: {
        gte: warnWindowStart,
        lte: warnWindowEnd,
      },
    },
    include: {
      user: true,
    },
  });

  for (const sub of expiringSoon) {
    const telegramUser = await prisma.telegramUser.findFirst({
      where: { userId: sub.userId },
    });

    if (telegramUser) {
      await sendTelegramMessage(
        Number(telegramUser.tgUserId),
        `⚠️ Your subscription expires in 24 hours.\nRenew to avoid losing access to Telegram groups.`
      );
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { warned24h: true },
    });
  }

  // ====================================================
  // 2️⃣ Mark expired subscriptions + start grace period
  // ====================================================
  const newlyExpired = await prisma.subscription.findMany({
    where: {
      status: "active",
      currentPeriodEnd: { lt: now },
      warnedExpired: false,
    },
  });

  for (const sub of newlyExpired) {
    const graceEnd = new Date(
      now.getTime() + GRACE_PERIOD_HOURS * 3600 * 1000
    );

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        warnedExpired: true,
        kickAfter: graceEnd,
      },
    });

    const telegramUser = await prisma.telegramUser.findFirst({
      where: { userId: sub.userId },
    });

    if (telegramUser) {
      await sendTelegramMessage(
        Number(telegramUser.tgUserId),
        `⚠️ Your subscription has expired.\nYou have ${GRACE_PERIOD_HOURS} hours to renew before access is revoked.`
      );
    }
  }

  // ====================================================
  // 3️⃣ Enqueue revoke-access after grace period
  // ====================================================
  const toRevoke = await prisma.subscription.findMany({
    where: {
      status: "active",
      kickAfter: { lt: now },
    },
  });

  for (const sub of toRevoke) {
    if (revokeQueue) {
      await revokeQueue.add("revoke-access", {
        subscriptionId: sub.id,
      });
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "canceled",
      },
    });
  }

  console.log("✅ Subscription cron completed");
});
