import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { addUserToGroup, sendTelegramMessage, kickFromGroup } from "../../../../packages/shared/telegram";

const prisma = new PrismaClient();
let redis: IORedis | null = null;
if (process.env.REDIS_URL) {
  redis = new IORedis(process.env.REDIS_URL);
}

let revokeQueue: Queue | null = null;
if (process.env.REDIS_URL) {
  const connection = new IORedis(process.env.REDIS_URL);

  revokeQueue = new Queue("revoke-access", { connection });
}

cron.schedule("*/10 * * * *", async () => {
  console.log("⏳ Running subscription warning & expiry cron...");

  const now = new Date();

  // 1️⃣ Find subscriptions expiring in 24 hours
  const expiringSoon = await prisma.subscription.findMany({
    where: {
      status: "active",
      warned24h: false,
      currentPeriodEnd: {
        gte: new Date(now.getTime() + 23 * 3600 * 1000),
        lte: new Date(now.getTime() + 25 * 3600 * 1000),
      },
    },
    include: { user: true },
  });

  for (const sub of expiringSoon) {
    const telegramUser = await prisma.telegramUser.findFirst({
      where: { userId: sub.userId },
    });

    if (telegramUser) {
      await sendTelegramMessage(
        Number(telegramUser.tgUserId),
        `⚠️ *Your subscription expires in 24 hours.*\nPlease renew to avoid removal from Telegram groups.`
      );
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { warned24h: true },
    });
  }

  // 2️⃣ Find expired subs where grace has not yet passed
  const expired = await prisma.subscription.findMany({
    where: {
      status: "active",
      currentPeriodEnd: { lt: now },
      warnedExpired: false,
    },
  });

  for (const sub of expired) {
    // Set grace period (e.g., 12 hours)
    const graceEnd = new Date(now.getTime() + 12 * 3600 * 1000);

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
        `⚠️ Your subscription has expired.\nYou have a 12-hour grace period before access is revoked.`
      );
    }
  }

  // 3️⃣ Kick users whose gracePeriod ended
  const toKick = await prisma.subscription.findMany({
    where: {
      status: "active",
      kickAfter: { lt: now },
    },
  });

  for (const sub of toKick) {
    // queue revoke job
    await revokeQueue.add("revoke", {
      subscriptionId: sub.id,
      reason: "expired_with_grace",
    });

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "canceled" },
    });
  }
});

