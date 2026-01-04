// // apps/api/src/integrations/telegramChatMember.ts

import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { kickFromGroup } from "../lib/telegram";


const prisma = new PrismaClient();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
async function enforceJoin(chatId: number, userId: number) {
  const tgGroupId = BigInt(chatId);
  const tgUserId = BigInt(userId);

  console.log("🔐 Enforcing join:", tgGroupId, tgUserId);

  // 1️⃣ Group lookup
  const group = await prisma.telegramGroup.findUnique({
    where: { tgGroupId },
    include: { products: { select: { id: true } } },
  });

  if (!group || !group.isConnected) return;
  if (group.products.length === 0) return;

  // 2️⃣ Telegram user mapping
  const telegramUser = await prisma.telegramUser.findUnique({
    where: { tgUserId },
  });

  if (!telegramUser) {
    await kickFromGroup(tgGroupId, Number(userId));
    return;
  }

  // 3️⃣ Subscription check
  const hasValidSubscription = await prisma.subscription.findFirst({
    where: {
      userId: telegramUser.userId,
      productId: { in: group.products.map(p => p.id) },
      status: "active",
      currentPeriodEnd: { gt: new Date() },
    },
  });

  if (!hasValidSubscription) {
    await kickFromGroup(tgGroupId, Number(userId));

    await prisma.telegramActivityLog.create({
      data: {
        creatorId: group.creatorId,
        groupId: group.id,
        tgUserId,
        event: "kick",
        reason: "no_active_subscription",
      },
    });

    return;
  }

  await prisma.telegramActivityLog.create({
    data: {
      creatorId: group.creatorId,
      groupId: group.id,
      tgUserId,
      event: "allowed",
    },
  });

  console.log("✅ Allowed:", tgUserId.toString());
}


export async function handleChatMemberUpdate(update: any) {
  console.log("🔔 Chat member update received");
  try {
    // --------------------------------------------------
    // CASE 1: legacy join event (MOST COMMON)
    // --------------------------------------------------
    if (update.message?.new_chat_member || update.message?.new_chat_members) {
      const chat = update.message.chat;
      const members =
        update.message.new_chat_members ??
        [update.message.new_chat_member];

      for (const member of members) {
        if (member.is_bot) continue;

        await enforceJoin(chat.id, member.id);
      }

      return;
    }

    // --------------------------------------------------
    // CASE 2: chat_member status update
    // --------------------------------------------------
    if (update.chat_member) {
      const { chat, old_chat_member, new_chat_member } =
        update.chat_member;

      if (
        !chat ||
        !new_chat_member?.user ||
        new_chat_member.user.is_bot
      ) {
        return;
      }

      const joined =
        ["left", "kicked"].includes(old_chat_member?.status) &&
        new_chat_member.status === "member";

      if (!joined) return;

      await enforceJoin(chat.id, new_chat_member.user.id);
    }
  } catch (err) {
    console.error("telegram join enforcement error:", err);
  }
}


/* -------------------------------------------------- */

// async function kickUser(chatId: number, userId: number) {
//   const res = await fetch(`${API}/banChatMember`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       chat_id: chatId,
//       user_id: userId,
//       until_date: Math.floor(Date.now() / 1000) + 60,
//     }),
//   });

//   const json = await res.json();

//   if (!json.ok) {
//     console.error("❌ Kick failed:", json);
//   } else {
//     console.log("👢 User kicked:", userId);
//   }
// }



