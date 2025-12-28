// packages/worker/src/worker.ts

import "dotenv/config";
import { Worker, QueueScheduler } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "../../../apps/api/node_modules/@prisma/client";
import {
  createInviteLink,
  sendTelegramMessage,
  kickFromGroup,
} from "../../shared/telegram";

const prisma = new PrismaClient();

/* -------------------------------------------------------
   Redis (OPTIONAL but recommended)
------------------------------------------------------- */
const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL)
  : undefined;

// Enables retries + delayed jobs

/* =======================================================
   GRANT ACCESS WORKER (NO AUTO-ADD)
======================================================= */
new Worker(
  "grant-access",
  async (job) => {
    const { subscriptionId } = job.data;
    if (!subscriptionId) throw new Error("subscriptionId missing");

    console.log("🎟 Grant-access:", subscriptionId);

    // 1️⃣ Load subscription + product + creator + groups
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        product: {
          include: {
            creator: true,
            telegramGroups: true,
          },
        },
      },
    });

    if (!subscription || !subscription.product) return;

    const groups = subscription.product.telegramGroups.filter(
      (g) => g.isConnected
    );

    if (groups.length === 0) {
      console.log("ℹ️ No Telegram groups mapped");
      return;
    }

    // 2️⃣ Find Telegram access record
    const accesses = await prisma.accessControl.findMany({
  where: {
    subscriptionId,
    platform: "telegram",
  },
});

for (const access of accesses) {
  if (!access.platformUserId) continue;

  // grant per group
  const tgUserId = Number(access.platformUserId);

    // 3️⃣ Generate invite links + DM user
    const inviteLinks: string[] = [];

    for (const group of groups) {
      try {
        const link = await createInviteLink(group.tgGroupId);
        inviteLinks.push(
          `• ${group.title || "Telegram Group"}\n${link}`
        );
      } catch (err) {
        console.error("Invite link failed:", err);
      }
    }

    if (inviteLinks.length > 0) {
      await sendTelegramMessage(
        tgUserId,
        `🎉 Your subscription is active!\n\nJoin your groups:\n\n${inviteLinks.join(
          "\n\n"
        )}`
      );
    }

    // 4️⃣ Mark access as granted
    await prisma.accessControl.update({
      where: { id: access.id },
      data: {
        status: "granted",
        grantedAt: new Date(),
        metadata: {
  ...(access.metadata as Record<string, unknown> ?? {}),
  telegramGroupIds: groups.map((g) => g.tgGroupId.toString()),
},

      },
    });
}
    console.log("✅ Access granted:", subscriptionId);
  },
  { connection, concurrency: 2 }
);

/* =======================================================
   REVOKE ACCESS WORKER (AUTO-KICK)
======================================================= */
new Worker(
  "revoke-access",
  async (job) => {
    const { subscriptionId } = job.data;
    if (!subscriptionId) throw new Error("subscriptionId missing");

    console.log("🚫 Revoke-access:", subscriptionId);

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        product: { include: { telegramGroups: true } },
      },
    });

    if (!subscription) return;

    if (!["canceled", "unpaid", "past_due"].includes(subscription.status)) {
      return;
    }

    if (!subscription.currentPeriodEnd) return;

    // 24h grace period
    const revokeAfter =
      new Date(subscription.currentPeriodEnd).getTime() +
      24 * 60 * 60 * 1000;

    if (Date.now() < revokeAfter) return;

    const accesses = await prisma.accessControl.findMany({
  where: {
    subscriptionId,
    platform: "telegram",
    status: "granted",
  },
});

for (const access of accesses) {
  if (!access.platformUserId) continue;

  // revoke per group
  const tgUserId = Number(access.platformUserId);
    const groups = subscription.product.telegramGroups.filter(
  (g) => g.isConnected
);


    for (const group of groups) {
      try {
        await kickFromGroup(group.tgGroupId, tgUserId);

        await prisma.telegramActivityLog.create({
          data: {
            creatorId: subscription.product.creatorId,
            groupId: group.id,
            tgUserId: BigInt(tgUserId),
            event: "subscription_expired",
          },
        });
      } catch (err) {
        console.error("Kick failed:", err);
      }
    }

    await prisma.accessControl.update({
      where: { id: access.id },
      data: {
        status: "revoked",
        revokedAt: new Date(),
      },
    });
}
    console.log("🔻 Access revoked:", subscriptionId);
  },
  { connection, concurrency: 2 }
);

console.log("🚀 Worker running");