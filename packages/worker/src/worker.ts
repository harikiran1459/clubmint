// packages/worker/src/worker.ts

import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";

// shared runtime helpers (compiled JS)
import {
  createInviteLink,
  sendTelegramMessage,
  kickFromGroup,
} from "./telegram";


const prisma = new PrismaClient();

/* -------------------------------------------------------
   Redis
------------------------------------------------------- */
const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL)
  : undefined;

/* =======================================================
   GRANT ACCESS WORKER
======================================================= */
new Worker(
  "grant-access",
  async (job) => {
    const { subscriptionId } = job.data;
    if (!subscriptionId) throw new Error("subscriptionId missing");

    console.log("🎟 Grant-access:", subscriptionId);

    // 1️⃣ Load subscription (NO includes)
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
        userId: true,
        productId: true,
      },
    });

    if (!subscription) return;

    // 2️⃣ Load product → telegram groups
    const product = await prisma.product.findUnique({
      where: { id: subscription.productId },
      select: {
        telegramGroups: {
          where: { isConnected: true },
        },
      },
    });

    if (!product || product.telegramGroups.length === 0) {
      console.log("ℹ️ No Telegram groups mapped");
      return;
    }

    // 3️⃣ Find Telegram access controls
    const accesses = await prisma.accessControl.findMany({
      where: {
        subscriptionId,
        platform: "telegram",
      },
    });

    for (const access of accesses) {
      if (!access.platformUserId) continue;

      const tgUserId = Number(access.platformUserId);
      const inviteLinks: string[] = [];

      // 4️⃣ Generate invite links
      for (const group of product.telegramGroups) {
        try {
          const link = await createInviteLink(group.tgGroupId);
          inviteLinks.push(
            `• ${group.title || "Telegram Group"}\n${link}`
          );
        } catch (err) {
          console.error("Invite link failed:", err);
        }
      }

      // 5️⃣ DM user
      if (inviteLinks.length > 0) {
        await sendTelegramMessage(
          tgUserId,
          `🎉 Your subscription is active!\n\nJoin your groups:\n\n${inviteLinks.join(
            "\n\n"
          )}`
        );
      }

      // 6️⃣ Mark access granted
      await prisma.accessControl.update({
        where: { id: access.id },
        data: {
          status: "granted",
          grantedAt: new Date(),
          metadata: {
            ...(access.metadata as any ?? {}),
            telegramGroupIds: product.telegramGroups.map((g) =>
              g.tgGroupId.toString()
            ),
          },
        },
      });
    }

    console.log("✅ Access granted:", subscriptionId);
  },
  { connection, concurrency: 2 }
);

/* =======================================================
   REVOKE ACCESS WORKER
======================================================= */
new Worker(
  "revoke-access",
  async (job) => {
    const { subscriptionId } = job.data;
    if (!subscriptionId) return;

    console.log("🚫 Revoke-access:", subscriptionId);

    // 1️⃣ Load subscription safely
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
        kickAfter: true,
        accessControls: true,
      },
    });

    if (!subscription?.kickAfter) return;
    if (Date.now() < subscription.kickAfter.getTime()) return;

    for (const access of subscription.accessControls) {
      if (
        access.platform !== "telegram" ||
        access.status !== "granted" ||
        !access.platformUserId
      ) continue;

      const tgUserId = Number(access.platformUserId);
      const groupIds =
        (access.metadata as any)?.telegramGroupIds ?? [];

      for (const tgGroupId of groupIds) {
        try {
          await kickFromGroup(BigInt(tgGroupId), tgUserId);
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
