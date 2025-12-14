import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { logActivity } from "../utils/logActivity";
import { handleChatMemberUpdate } from "./telegramChatMember";

const prisma = new PrismaClient();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------
async function sendMessage(chatId: number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("sendMessage error:", err);
  }
}

// Adds user to ALL creator groups (for verification flow)
async function addUserToCreatorGroups(creatorId: string, tgUserId: bigint) {
  const groups = await prisma.telegramGroup.findMany({
    where: { creatorId },
  });

  for (const g of groups) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/unbanChatMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: g.tgGroupId.toString(),
          user_id: tgUserId.toString(),
          only_if_banned: false,
        }),
      });

      await logActivity({
        creatorId,
        groupId: g.id,
        tgUserId,
        event: "auto_add",
        reason: "verification_success",
      });
    } catch (err) {
      console.error("Group add error:", err);
    }
  }
}

// ------------------------------------------------------------------
// MAIN UPDATE HANDLER (MESSAGE TEXTS)
// ------------------------------------------------------------------
export async function handleTelegramUpdate(update: any) {
  
  // Existing message handling
  const msg = update.message;
  if (!msg) return;

  const chatId = msg.chat.id;
  const from = msg.from!;
  const text = msg.text?.trim() || "";
  const tgUserId = BigInt(from.id);

  console.log("Received message:", text);
  // NEW: Detect chat_member joins
  if (update.chat_member) {
    await handleChatMemberUpdate(update.chat_member);
    return;
  }

  // ==============================================================  
  // 1. VERIFICATION CODE  
  // ==============================================================  
  if (/^[A-Z0-9]{6}$/i.test(text)) {
    const code = text.toUpperCase();

    const record = await prisma.telegramVerification.findFirst({
      where: {
        code,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return sendMessage(chatId, "❌ Invalid or expired verification code.");
    }

    // Link user ↔ Telegram
    await prisma.telegramUser.upsert({
      where: { tgUserId },
      update: {
        userId: record.userId,
        tgUsername: from.username ?? null,
      },
      create: {
        tgUserId,
        userId: record.userId,
        tgUsername: from.username ?? null,
      },
    });

    // Mark code used
    await prisma.telegramVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    // Check subscription
    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId: record.userId,
        status: "active",
        product: { creatorId: record.creatorId },
      },
      include: { product: true },
    });

    if (!activeSub)
      return sendMessage(
        chatId,
        "⚠️ Connected, but no active subscription found."
      );

    await addUserToCreatorGroups(record.creatorId, tgUserId);

    return sendMessage(
      chatId,
      `🎉 *Success!* Telegram verified.\nYou now have access to *${activeSub.product.title}* groups.`
    );
  }

  // ==============================================================  
  // 2. CREATOR SENDS GROUP INVITE LINK  
  // ==============================================================  
  if (/https:\/\/t\.me\/.+/i.test(text)) {
    const tgUser = await prisma.telegramUser.findUnique({
      where: { tgUserId },
    });

    if (!tgUser)
      return sendMessage(chatId, "❌ Please connect your account first.");

    const creator = await prisma.creator.findUnique({
      where: { userId: tgUser.userId },
    });

    if (!creator) return sendMessage(chatId, "❌ Creator profile not found.");

    const joinRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/joinChat?invite_link=${encodeURIComponent(
        text
      )}`
    );

    const joined = (await joinRes.json()) as {
  ok: boolean;
  result?: { id: number };
};
    if (!joined.ok) return sendMessage(chatId, "❌ Bot failed to join the group.");

    await prisma.telegramGroup.create({
      data: {
        tgGroupId: BigInt(joined.result.id),
        creatorId: creator.id,
        inviteLink: text,
      },
    });

    return sendMessage(chatId, "🎉 Group connected successfully!");
  }

  // Default
  return sendMessage(
    chatId,
    "👋 Send a 6-digit verification code to connect Telegram."
  );
}

// ------------------------------------------------------------------
// BOT INSTANCE
// ------------------------------------------------------------------
export const bot = new TelegramBot(BOT_TOKEN);
bot.stopPolling(); // Ensure no duplicate polling

if (!global.__bot_started__) {
  global.__bot_started__ = true;
  const WEBHOOK_URL = `${process.env.API_BASE_URL}/telegram/webhook`;

  (async () => {
    try {
      await bot.setWebHook(WEBHOOK_URL);
      console.log("🚀 Telegram webhook registered:", WEBHOOK_URL);
    } catch (err) {
      console.error("Failed to set webhook:", err);
    }
  })();


  async function sendWelcomeDM(tgUserId: bigint, creatorId: string, productTitle: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: tgUserId.toString(),
        text: `🎉 *Welcome!*\n\nYour subscription gives you access to *${productTitle}*\nIf you have any questions, reply here any time.`,
        parse_mode: "Markdown"
      })
    });

    await logActivity({
      creatorId,
      groupId: "",    // DM → no group
      tgUserId,
      event: "dm_welcome",
      reason: "new_valid_subscription"
    });
  } catch (err) {
    console.error("Welcome DM error:", err);
  }
}

async function sendGroupWelcomeMessage(groupId: bigint, tgUserId: bigint, userName: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: groupId.toString(),
        text: `👋 Welcome @${userName}!`,
        parse_mode: "Markdown"
      }),
    });
  } catch (err) {
    console.error("Group welcome message error:", err);
  }
}

  console.log("🤖 Telegram bot running (polling)...");
}

export default bot;