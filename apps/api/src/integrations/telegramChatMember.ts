import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { logActivity } from "../utils/logActivity";

const prisma = new PrismaClient();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function handleChatMemberUpdate(data: any) {
  try {
    const chat = data.chat;
    const change = data.new_chat_member;
    const user = change?.user;

    if (!chat || !user) return;
    if (user.is_bot) return;

    const tgUserId = BigInt(user.id);

    // 1️⃣ Find the group in DB
    const creatorGroup = await prisma.telegramGroup.findUnique({
      where: { tgGroupId: BigInt(chat.id) }
    });

    if (!creatorGroup) return;

    const creatorId = creatorGroup.creatorId;

    // 2️⃣ Identify the Telegram user
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { tgUserId }
    });

    if (!telegramUser) {
      await logActivity({
        creatorId,
        groupId: creatorGroup.id,
        tgUserId,
        event: "kick",
        reason: "unverified_user"
      });

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/kickChatMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat.id,
          user_id: user.id
        })
      });

      return;
    }

    // 3️⃣ Check for active subscription
    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId: telegramUser.userId,
        status: "active",
        product: { creatorId }
      },
      include: { product: { include: { telegramGroups: true } } }
    });

    if (!activeSub) {
      await logActivity({
        creatorId,
        groupId: creatorGroup.id,
        tgUserId,
        event: "kick",
        reason: "no_active_subscription"
      });

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/kickChatMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat.id,
          user_id: user.id
        })
      });

      return;
    }

    // 4️⃣ Check if product is mapped to this group
    const allowed = activeSub.product.telegramGroups.some(
      (g) => g.id === creatorGroup.id
    );

    if (!allowed) {
      await logActivity({
        creatorId,
        groupId: creatorGroup.id,
        tgUserId,
        event: "kick",
        reason: "product_not_mapped_to_group"
      });

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/kickChatMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat.id,
          user_id: user.id
        })
      });

      return;
    }

    // 5️⃣ Allow + log
    await logActivity({
      creatorId,
      groupId: creatorGroup.id,
      tgUserId,
      event: "allowed",
      reason: "valid_subscription"
    });

    console.log(`✅ Allowed user ${user.id}`);
  } catch (err) {
    console.error("chat_member handler error:", err);
  }
}
