// // apps/api/src/integrations/telegramChatMember.ts

import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
const { kickFromGroup } = require("../../packages/shared/dist/telegram");



const prisma = new PrismaClient();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function handleChatMemberUpdate(update: any) {
  try {
    const { chat, old_chat_member, new_chat_member } = update.chat_member;
    if (!chat || !new_chat_member?.user) return;
    if (new_chat_member.user.is_bot) return;

    const joined =
      ["left", "kicked"].includes(old_chat_member?.status) &&
      new_chat_member.status === "member";

    if (!joined) return;

    const tgGroupId = BigInt(chat.id);
    const tgUserId = BigInt(new_chat_member.user.id);

    // 1️⃣ Find group
    const group = await prisma.telegramGroup.findUnique({
      where: { tgGroupId },
      include: { products: { select: { id: true } } },
    });

    if (!group || !group.isConnected) return;

    // If no products linked → treat as open group
    if (group.products.length === 0) return;

    // 2️⃣ Resolve Telegram user → app user
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { tgUserId },
    });

    if (!telegramUser) {
      await kickFromGroup(
  BigInt(chat.id),
  Number(new_chat_member.user.id)
);

      return;
    }

    // 3️⃣ Check subscription against group products
    const hasValidSubscription = await prisma.subscription.findFirst({
      where: {
        userId: telegramUser.userId,
        productId: { in: group.products.map(p => p.id) },
        status: "active",
        currentPeriodEnd: { gt: new Date() },
      },
    });

    if (!hasValidSubscription) {
      await kickFromGroup(
  BigInt(chat.id),
  Number(new_chat_member.user.id)
);

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


    console.log("✅ Allowed to stay");
  } catch (err) {
    console.error("telegramChatMember error:", err);
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



