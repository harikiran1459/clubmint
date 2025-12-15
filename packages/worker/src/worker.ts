// packages/worker/src/worker.ts
import "dotenv/config";
import { Worker, QueueScheduler } from "bullmq";
import IORedis from "ioredis";
import fetch from "node-fetch";
import { PrismaClient } from "../../../apps/api/node_modules/@prisma/client";
import { addUserToGroup, sendTelegramMessage, kickFromGroup } from "../../shared/telegram";

const prisma = new PrismaClient();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let connection: IORedis | null = null;
if (process.env.REDIS_URL) {
  connection = new IORedis(process.env.REDIS_URL);

/**
 * Ensures delayed jobs + retries work properly.
 */
new QueueScheduler("grant-access", { connection });
new QueueScheduler("revoke-access", { connection });

/* -------------------------------------------------------
   GRANT ACCESS WORKER (AUTO-ADD)
------------------------------------------------------- */
new Worker(
  "grant-access",
  async (job) => {
    console.log("🔧 Processing grant-access job:", job.data);

    const { subscriptionId } = job.data;
    if (!subscriptionId) throw new Error("subscriptionId missing!");

    // 1. Load subscription → user → product → creator
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        product: { include: { creator: true, telegramGroups: true } },
      },
    });

    if (!subscription) throw new Error("Subscription not found: " + subscriptionId);

    const creator = subscription.product.creator;
    if (!creator) throw new Error("Subscription has no creator");

    console.log("Creator:", creator.id);

    // 2. Load ALL Telegram groups for this creator
    const product = subscription.product;

    // get only mapped groups
    const groups = await prisma.telegramGroup.findMany({
      where: {
        id: { in: product.telegramGroups.map((g) => g.id) },
        isConnected: true,
      },
    });


    if (groups.length === 0) {
      console.log("❌ Creator has NO Telegram groups connected");
      return { ok: false, reason: "creator_missing_group" };
    }

    console.log("Creator groups:", groups.map(g => g.tgGroupId.toString()));

    // 3. Load subscriber Telegram ID
    const access = await prisma.accessControl.findFirst({
      where: { subscriptionId },
    });

    if (!access || !access.platformUserId) {
      console.log("❌ Subscriber missing Telegram ID");
      return { ok: false, reason: "missing_platform_userId" };
    }

    const subscriberTelegramId = Number(access.platformUserId);
    console.log("Subscriber Telegram User:", subscriberTelegramId);

    // 4. Add user to ALL groups
    for (const group of groups) {
      try {
        await addUserToGroup(group.tgGroupId, subscriberTelegramId);
        console.log(`✅ Added ${subscriberTelegramId} to group ${group.tgGroupId}`);
      } catch (err) {
        console.error("❌ Add failed:", err);
      }
    }

    // Optional DM
    await sendTelegramMessage(
      subscriberTelegramId,
      `🎉 Your subscription is active!\nYou now have access to all premium Telegram groups.`
    );

    // 5. Update DB
    const meta =
      typeof access.metadata === "object" && access.metadata !== null
        ? access.metadata
        : {};

    await prisma.accessControl.update({
      where: { id: access.id },
      data: {
        status: "granted",
        grantedAt: new Date(),
        metadata: {
          ...meta,
          telegramGroupIds: groups.map((g) => g.tgGroupId.toString()),
        },
      },
    });

    console.log("🎯 Access granted successfully for:", subscriptionId);
    return { ok: true };
  },
  { connection, concurrency: 2 }
);

/* -------------------------------------------------------
   REVOKE ACCESS WORKER (AUTO-KICK)
------------------------------------------------------- */
new Worker(
  "revoke-access",
  async (job) => {
    console.log("🔻 Processing revoke-access:", job.data);

    const { subscriptionId } = job.data;
    if (!subscriptionId) throw new Error("subscriptionId missing");

    // 1. Load subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        product: { include: { creator: true, telegramGroups: true } },
      },
    });
    if (!subscription) throw new Error("Subscription not found");

    const creator = subscription.product.creator;
    if (!creator) throw new Error("Invalid subscription: no creator found");

    // 2. Load ALL groups
    const product = subscription.product;

    // get only mapped groups
    const groups = await prisma.telegramGroup.findMany({
      where: {
        id: { in: product.telegramGroups.map((g) => g.id) },
        isConnected: true,
      },
    });


    if (groups.length === 0) {
      console.log("⚠️ Creator has no groups — nothing to revoke");
      return { ok: false };
    }

    console.log("Revoking from groups:", groups.map(g => g.tgGroupId.toString()));

    // 3. Subscriber
    const access = await prisma.accessControl.findFirst({
      where: { subscriptionId },
    });

    if (!access || !access.platformUserId) {
      console.log("⚠️ No subscriber Telegram ID; skipping kick.");
      return { ok: false };
    }

    const subscriberTelegramId = Number(access.platformUserId);

    // 4. Kick from ALL groups
    for (const group of groups) {
      try {
        await kickFromGroup(group.tgGroupId, subscriberTelegramId);
        console.log(`🚫 Kicked ${subscriberTelegramId} from ${group.tgGroupId}`);
      } catch (err) {
        console.error("Kick failed:", err);
      }
    }

    // DM user
    await sendTelegramMessage(
      subscriberTelegramId,
      `❌ Your subscription expired.\nAccess to the private groups has been revoked.`
    );

    // 5. DB update
    await prisma.accessControl.update({
      where: { id: access.id },
      data: {
        status: "revoked",
        revokedAt: new Date(),
      },
    });

    console.log("🔻 Access revoked for:", subscriptionId);
    return { ok: true };
  },
  { connection, concurrency: 2 }
);

console.log("Worker running…");

}
