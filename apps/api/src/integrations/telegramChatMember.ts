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

// apps/api/src/integrations/telegramChatMember.ts

import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_ID = process.env.TELEGRAM_BOT_ID
  ? Number(process.env.TELEGRAM_BOT_ID)
  : null;

if (!BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}
if (!BOT_ID) {
  console.warn("⚠️ TELEGRAM_BOT_ID missing — bot add detection will not work");
}

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * This handler is SILENT infra.
 * It:
 *  - creates TelegramGroup when bot is added
 *  - allows users ONLY if they were auto-added by ClubMint
 *  - kicks users when subscription is not active
 *  - NEVER sends messages
 *  - NEVER asks for verification
 */
export async function handleChatMemberUpdate(update: any) {
  try {
    const chat = update.chat;
    const newMember = update.new_chat_member;
    const oldMember = update.old_chat_member;

    if (!chat || !newMember?.user) return;

    const tgGroupId = BigInt(chat.id);
    const user = newMember.user;
    const tgUserId = BigInt(user.id);

    // --------------------------------------------------
    // 1️⃣ BOT ADDED TO GROUP → CREATE / UPDATE GROUP
    // --------------------------------------------------
    if (
      user.is_bot &&
      BOT_ID &&
      Number(user.id) === BOT_ID &&
      newMember.status !== oldMember?.status
    ) {
      // Identify creator by dashboard context:
      // The creator who invited the bot MUST later map the group in UI.
      // We only create the group record here.

      // ⚠️ creatorId is not inferred from Telegram.
      // It is attached later via dashboard mapping.
      // So we store group FIRST, unclaimed.

      await prisma.telegramGroup.upsert({
        where: { tgGroupId },
        create: {
          tgGroupId,
          inviteLink: "",
          title: chat.title ?? null,
          username: chat.username ?? null,
          type: chat.type ?? null,
          isConnected: true,
          // creatorId will be attached when creator maps the group
          creator: {
            connect: {
              id: await resolveCreatorForGroup(chat),
            },
          },
        },
        update: {
          title: chat.title ?? null,
          username: chat.username ?? null,
          type: chat.type ?? null,
          isConnected: true,
        },
      });

      return;
    }

    // --------------------------------------------------
    // 2️⃣ IGNORE BOT EVENTS & ADMIN CHANGES
    // --------------------------------------------------
    if (user.is_bot) return;

    // --------------------------------------------------
    // 3️⃣ USER JOINED GROUP → ENFORCE ACCESS
    // --------------------------------------------------
    if (
      newMember.status === "member" ||
      newMember.status === "restricted"
    ) {
      // Check if this user was auto-added by ClubMint
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

      if (!access) {
        // Not a ClubMint subscriber → kick silently
        await kickUser(chat.id, user.id);
        return;
      }

      // Valid subscriber → allow silently
      return;
    }

    // --------------------------------------------------
    // 4️⃣ USER LEFT / WAS REMOVED → NO ACTION
    // --------------------------------------------------
    return;
  } catch (err) {
    console.error("telegramChatMember handler error:", err);
  }
}

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

/**
 * Kick user from group (silent)
 */
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

/**
 * Resolve creator for group.
 *
 * IMPORTANT:
 * We do NOT trust Telegram for creator identity.
 * The creator–group association is finalized in dashboard mapping.
 *
 * For now, we attach to a temporary system creator placeholder
 * OR require creator mapping immediately after bot add.
 */
async function resolveCreatorForGroup(chat: any): Promise<string> {
  // 🔒 Security rule:
  // Group ownership is finalized ONLY in dashboard mapping.
  // Here we attach a placeholder creator to satisfy schema.

  const systemCreator = await prisma.creator.findFirst({
    where: { isSystem: true },
  });

  if (!systemCreator) {
    throw new Error(
      "System creator missing — required for Telegram group bootstrap"
    );
  }

  return systemCreator.id;
}
