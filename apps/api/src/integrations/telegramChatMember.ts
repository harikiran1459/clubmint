// // apps/api/src/integrations/telegramChatMember.ts

// import { PrismaClient } from "@prisma/client";
// import fetch from "node-fetch";
// import { logActivity } from "../utils/logActivity";

// const prisma = new PrismaClient();
// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// if (!BOT_TOKEN) {
//   throw new Error("TELEGRAM_BOT_TOKEN is not set");
// }

// /* -------------------------------------------------------------
//    TELEGRAM API HELPER
// ------------------------------------------------------------- */
// async function tg(method: string, body: any) {
//   return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });
// }

// /* -------------------------------------------------------------
//    MAIN HANDLER
// ------------------------------------------------------------- */
// export async function handleChatMemberUpdate(update: any) {
//   try {
//     const chat = update.chat;
//     const oldMember = update.old_chat_member;
//     const newMember = update.new_chat_member;

//     if (!chat || !oldMember || !newMember) return;
//     if (newMember.user?.is_bot) return;

//     const tgUserId = BigInt(newMember.user.id);
//     const tgGroupId = BigInt(chat.id);

//     const oldStatus = oldMember.status;
//     const newStatus = newMember.status;

//     // Only care about joins / permissions changes
//     if (oldStatus === newStatus) return;

//     /* ---------------------------------------------------------
//        1️⃣ Resolve group → creator
//     --------------------------------------------------------- */
//     const creatorGroup = await prisma.telegramGroup.findUnique({
//       where: { tgGroupId },
//     });

//     if (!creatorGroup || !creatorGroup.creatorId) return;

//     const creatorId = creatorGroup.creatorId;

//     /* ---------------------------------------------------------
//        2️⃣ Resolve Telegram user
//     --------------------------------------------------------- */
//     const telegramUser = await prisma.telegramUser.findUnique({
//       where: { tgUserId },
//     });

//     // Not verified → restrict (NOT kick)
//     if (!telegramUser) {
//       if (newStatus !== "restricted" && newStatus !== "left") {
//         await tg("restrictChatMember", {
//           chat_id: tgGroupId.toString(),
//           user_id: tgUserId.toString(),
//           permissions: {
//             can_send_messages: false,
//             can_send_media_messages: false,
//             can_send_polls: false,
//             can_send_other_messages: false,
//             can_add_web_page_previews: false,
//           },
//         });

//         await logActivity({
//           creatorId,
//           groupId: creatorGroup.id,
//           tgUserId,
//           event: "restricted",
//           reason: "telegram_not_verified",
//         });
//       }
//       return;
//     }

//     if (
//   update.new_chat_member.user?.is_bot &&
//   update.new_chat_member.user.id.toString() === process.env.TELEGRAM_BOT_ID
// ) {
//   await await prisma.telegramGroup.upsert({
//   where: { tgGroupId },
//   create: {
//     tgGroupId,
//     inviteLink: "",
//     creator: {
//       connect: { id: creatorId },
//     },
//     title: chat.title ?? null,
//     username: chat.username ?? null,
//     type: chat.type ?? null,
//     isConnected: true,
//   },
//   update: {
//     title: chat.title ?? null,
//     username: chat.username ?? null,
//     type: chat.type ?? null,
//     isConnected: true,
//   },
// });


//   return;
// }


//     /* ---------------------------------------------------------
//        3️⃣ Check active subscription
//     --------------------------------------------------------- */
//     const activeSub = await prisma.subscription.findFirst({
//       where: {
//         userId: telegramUser.userId,
//         status: "active",
//         product: {
//           creatorId,
//           telegramGroups: {
//             some: { id: creatorGroup.id },
//           },
//         },
//       },
//     });

//     // No valid subscription → restrict
//     if (!activeSub) {
//       if (newStatus !== "restricted" && newStatus !== "left") {
//         await tg("restrictChatMember", {
//           chat_id: tgGroupId.toString(),
//           user_id: tgUserId.toString(),
//           permissions: {
//             can_send_messages: false,
//             can_send_media_messages: false,
//             can_send_polls: false,
//             can_send_other_messages: false,
//             can_add_web_page_previews: false,
//           },
//         });

//         await logActivity({
//           creatorId,
//           groupId: creatorGroup.id,
//           tgUserId,
//           event: "restricted",
//           reason: "no_active_subscription",
//         });
//       }
//       return;
//     }

//     /* ---------------------------------------------------------
//        4️⃣ Allow user if subscription valid
//     --------------------------------------------------------- */
//     if (newStatus === "restricted") {
//       await tg("restrictChatMember", {
//         chat_id: tgGroupId.toString(),
//         user_id: tgUserId.toString(),
//         permissions: {
//           can_send_messages: true,
//           can_send_media_messages: true,
//           can_send_polls: true,
//           can_send_other_messages: true,
//           can_add_web_page_previews: true,
//         },
//       });

//       await logActivity({
//         creatorId,
//         groupId: creatorGroup.id,
//         tgUserId,
//         event: "allowed",
//         reason: "valid_subscription",
//       });
//     }
//   } catch (err) {
//     console.error("telegramChatMember error:", err);
//   }
// }

import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Telegram chat_member webhook handler
 *
 * Sublaunch-style enforcement:
 * - Bot does NOT talk
 * - Bot does NOT verify
 * - Bot does NOT infer creator
 *
 * RULE:
 *   Only users auto-added by ClubMint may stay.
 */
export async function handleChatMemberUpdate(update: any) {
  try {
    const chat = update.chat;
    const newMember = update.new_chat_member;

    if (!chat || !newMember?.user) return;

    // Ignore bots
    if (newMember.user.is_bot) return;

    const tgGroupId = BigInt(chat.id);
    const tgUserId = BigInt(newMember.user.id);

    // Only react when user becomes member
    if (newMember.status !== "member") return;

    // 🔍 Check if this user was auto-added by ClubMint
    const access = await prisma.accessControl.findFirst({
      where: {
        platform: "telegram",
        platformUserId: tgUserId.toString(),
        status: "granted",
        metadata: {
          path: ["telegramGroupIds"],
          array_contains: [tgGroupId.toString()],
        },
      },
    });

    // ❌ Not a valid subscriber → kick silently
    if (!access) {
      await kickUser(chat.id, newMember.user.id);
      return;
    }

    // ✅ Valid subscriber → allow silently
    return;

  } catch (err) {
    console.error("telegramChatMember error:", err);
  }
}

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

async function kickUser(chatId: number, userId: number) {
  try {
    await fetch(`${API}/banChatMember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
      }),
    });
  } catch (err) {
    console.error("Failed to kick user:", err);
  }
}



