// // apps/api/src/integrations/telegram.ts

// import "dotenv/config";
// import TelegramBot from "node-telegram-bot-api";
// import fetch from "node-fetch";
// import { PrismaClient } from "@prisma/client";
// import { handleChatMemberUpdate } from "./telegramChatMember";
// import { logActivity } from "../utils/logActivity";
// import { createAlert } from "../utils/createAlert";

// const prisma = new PrismaClient();

// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// if (!BOT_TOKEN) {
//   throw new Error("TELEGRAM_BOT_TOKEN is not set");
// }

// /* ------------------------------------------------------------------
//    BOT INSTANCE (WEBHOOK MODE ONLY)
// ------------------------------------------------------------------ */

// export const bot = new TelegramBot(BOT_TOKEN, {
//   polling: false,
// });

// /* ------------------------------------------------------------------
//    LOW-LEVEL TELEGRAM HELPERS
// ------------------------------------------------------------------ */

// async function tg(method: string, body: any) {
//   const res = await fetch(
//     `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     }
//   );
//   return res.json();
// }

// async function sendMessage(chatId: bigint, text: string) {
//   try {
//     await tg("sendMessage", {
//       chat_id: chatId.toString(),
//       text,
//       parse_mode: "Markdown",
//     });
//   } catch (err) {
//     console.error("sendMessage error:", err);
//   }
// }

// /* ------------------------------------------------------------------
//    ACCESS CONTROL (USED BY WORKERS & FAILSAFE)
// ------------------------------------------------------------------ */

// async function grantTelegramAccess(access: any) {
//   const tgUserId = BigInt(access.platformUserId);
//   const tgGroupId = BigInt(access.metadata.tgGroupId);

//   try {
//     await tg("unbanChatMember", {
//       chat_id: tgGroupId.toString(),
//       user_id: tgUserId.toString(),
//       only_if_banned: false,
//     });

//     await prisma.accessControl.update({
//       where: { id: access.id },
//       data: {
//         status: "granted",
//         grantedAt: new Date(),
//       },
//     });

//     await logActivity({
//       creatorId: access.subscription.creatorId,
//       groupId: access.metadata.groupId,
//       tgUserId,
//       event: "allowed",
//       reason: "subscription_active",
//     });
//   } catch (err) {
//     console.error("Grant access error:", err);
//   }
// }

// /* ------------------------------------------------------------------
//    MAIN UPDATE HANDLER (WEBHOOK ENTRY)
// ------------------------------------------------------------------ */

// export async function handleTelegramUpdate(update: any) {
//   try {
//     // 1️⃣ Chat member updates (MOST IMPORTANT)
//     if (update.chat_member || update.my_chat_member) {
//       await handleChatMemberUpdate(
//         update.chat_member ?? update.my_chat_member
//       );
//       return;
//     }

//     // 2️⃣ Regular messages
//     const msg = update.message;
//     if (!msg || !msg.text || !msg.from) return;

//     const chatId = BigInt(msg.chat.id);
//     const tgUserId = BigInt(msg.from.id);
//     const text = msg.text.trim();

//     /* --------------------------------------------------------------
//        VERIFICATION CODE FLOW
//     -------------------------------------------------------------- */
//     if (/^[A-Z0-9]{6}$/i.test(text)) {
//       const code = text.toUpperCase();

//       const record = await prisma.telegramVerification.findFirst({
//         where: {
//           code,
//           verified: false,
//           expiresAt: { gt: new Date() },
//         },
//       });

//       if (!record) {
//         await sendMessage(chatId, "❌ Invalid or expired verification code.");
//         return;
//       }

//       // Link Telegram user
//       await prisma.telegramUser.upsert({
//         where: { tgUserId },
//         update: {
//           userId: record.userId,
//           tgUsername: msg.from.username ?? null,
//         },
//         create: {
//           tgUserId,
//           userId: record.userId,
//           tgUsername: msg.from.username ?? null,
//         },
//       });

//       await prisma.telegramVerification.update({
//         where: { id: record.id },
//         data: { verified: true },
//       });

//       // Attach tgUserId to pending access
//       await prisma.accessControl.updateMany({
//         where: {
//           platform: "telegram",
//           status: "pending",
//           subscription: {
//             userId: record.userId,
//             status: "active",
//             product: { creatorId: record.creatorId },
//           },
//         },
//         data: {
//           platformUserId: tgUserId.toString(),
//         },
//       });

//       // Grant access where applicable
//       const pending = await prisma.accessControl.findMany({
//         where: {
//           platform: "telegram",
//           platformUserId: tgUserId.toString(),
//           status: "pending",
//         },
//         include: { subscription: true },
//       });

//       for (const access of pending) {
//         await grantTelegramAccess(access);
//       }

//       await sendMessage(
//         chatId,
//         "🎉 *Telegram verified!* You now have access to your subscribed groups."
//       );
//       return;
//     }

//     /* --------------------------------------------------------------
//        DEFAULT MESSAGE
//     -------------------------------------------------------------- */
//     await sendMessage(
//       chatId,
//       "👋 Send your 6-digit verification code to connect Telegram."
//     );
//   } catch (err) {
//     console.error("Telegram update handling error:", err);
//   }
// }

// /* ------------------------------------------------------------------
//    WEBHOOK REGISTRATION
// ------------------------------------------------------------------ */

// if (!global.__telegram_webhook_set__) {
//   global.__telegram_webhook_set__ = true;

//   const WEBHOOK_URL = process.env.API_BASE_URL
//     ? `${process.env.API_BASE_URL}/telegram/webhook`
//     : null;

//   if (!WEBHOOK_URL) {
//     console.warn("⚠️ API_BASE_URL not set, Telegram webhook not registered");
//   } else {
//     (async () => {
//       try {
//         await bot.setWebHook(WEBHOOK_URL);
//         console.log("🚀 Telegram webhook registered:", WEBHOOK_URL);
//       } catch (err) {
//         console.error("Failed to register Telegram webhook:", err);
//       }
//     })();
//   }
// }

// /* ------------------------------------------------------------------
//    FAILSAFE: PROCESS PENDING ACCESS EVERY 60s
// ------------------------------------------------------------------ */

// setInterval(async () => {
//   const pending = await prisma.accessControl.findMany({
//     where: {
//       platform: "telegram",
//       status: "pending",
//       platformUserId: { not: null },
//     },
//     include: { subscription: true },
//   });

//   for (const access of pending) {
//     await grantTelegramAccess(access);
//   }
// }, 60_000);


// apps/api/src/integrations/telegram.ts
// apps/api/src/integrations/telegram.ts
import "dotenv/config";
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN");

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Telegram webhook
 * Sublaunch-style group claiming
 */
export async function handleTelegramUpdate(update: any) {
  try {
    const msg = update.message;
    if (!msg?.text || !msg.chat) return;

    // Ignore private chats
    if (msg.chat.type === "private") return;

    const text = msg.text.trim();
    if (!text.startsWith("ClubMint-")) return;

    const chat = msg.chat;
    const tgGroupId = BigInt(chat.id);

    // ----------------------------------------
    // 1️⃣ Fetch valid unused claim
    // ----------------------------------------
    const claim = await prisma.telegramGroupClaim.findFirst({
      where: {
        code: text,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!claim) return; // silently ignore invalid code

    // ----------------------------------------
    // 2️⃣ Consume claim FIRST (critical)
    // ----------------------------------------
    await prisma.telegramGroupClaim.update({
      where: { id: claim.id },
      data: { used: true },
    });

    // ----------------------------------------
    // 3️⃣ Attach / create group
    // ----------------------------------------
    await prisma.telegramGroup.upsert({
      where: { tgGroupId },
      create: {
        tgGroupId,
        creatorId: claim.creatorId,
        inviteLink: "",
        title: chat.title ?? null,
        username: chat.username ?? null,
        type: chat.type ?? null,
        isConnected: true,
        claimCode: text,
      },
      update: {
        creatorId: claim.creatorId,
        title: chat.title ?? null,
        username: chat.username ?? null,
        type: chat.type ?? null,
        isConnected: true,
      },
    });

    // ----------------------------------------
    // 4️⃣ Confirmation message (important UX)
    // ----------------------------------------
    await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat.id,
        text: "✅ ClubMint connected successfully.\nYou may now return to your dashboard.",
      }),
    });

    console.log(
      `✅ Group ${tgGroupId.toString()} claimed by creator ${claim.creatorId}`
    );
  } catch (err) {
    console.error("Telegram webhook error:", err);
  }
}

