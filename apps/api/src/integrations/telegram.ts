// apps/api/src/integrations/telegram.ts
import "dotenv/config";
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";
import { CLUBMINT_PLANS } from "../config/plans";
import { handleChatMemberUpdate } from "./telegramChatMember";


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
    /* =====================================================
       🔥 REAL-TIME ENFORCEMENT (MOST COMMON JOIN CASE)
    ===================================================== */
    if (update.message?.new_chat_members?.length) {
      const chat = update.message.chat;

      for (const user of update.message.new_chat_members) {
        if (user.is_bot) continue;

        console.log("👤 New member joined:", chat.id, user.id);

        await handleChatMemberUpdate({
          chat_member: {
            chat,
            old_chat_member: { status: "left" },
            new_chat_member: {
              status: "member",
              user,
            },
          },
        });
      }

      // IMPORTANT: stop further processing
      return;
    }

    /* =====================================================
       🔁 chat_member update (LESS COMMON)
    ===================================================== */
    if (update.chat_member) {
      await handleChatMemberUpdate(update);
      return;
    }

    // Existing group-claim logic
    const msg = update.message || update.channel_post;
    if (!msg || typeof msg.text !== "string") return;

    if (msg.chat.type === "private") return;

    const text = msg.text.trim();
    if (!text.startsWith("CLUBMINT-")) return;

    const tgGroupId = BigInt(msg.chat.id);

    // 1️⃣ Fetch claim
    const claim = await prisma.telegramGroupClaim.findFirst({
      where: {
        code: text,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!claim) return;

    // 2️⃣ Ensure group is NOT already connected
    const existingGroup = await prisma.telegramGroup.findUnique({
      where: { tgGroupId },
    });

    if (existingGroup?.isConnected) {
      await fetch(`${API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: msg.chat.id,
          text: "⚠️ This Telegram group is already connected to a ClubMint account.",
        }),
      });
      return;
    }

    // 3️⃣ Verify bot is admin
    const adminCheck = await fetch(`${API}/getChatMember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        user_id: Number(process.env.TELEGRAM_BOT_ID),
      }),
    }).then((r) => r.json());

    if (
      !adminCheck.ok ||
      !["administrator", "creator"].includes(
        adminCheck.result?.status
      )
    ) {
      await fetch(`${API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: msg.chat.id,
          text:
            "❌ ClubMint bot must be an admin to connect this group.",
        }),
      });
      return;
    }

    // 4️⃣ Load creator & plan
    const creator = await prisma.creator.findUnique({
      where: { id: claim.creatorId },
      include: { telegramGroups: true },
    });

    if (!creator) return;

    const plan = CLUBMINT_PLANS[creator.plan];
    const maxGroups = plan.features.telegramGroups;

    const connectedGroups = creator.telegramGroups.filter(
      (g) => g.isConnected
    );

    if (
      Number.isFinite(maxGroups) &&
      connectedGroups.length >= maxGroups
    ) {
      await fetch(`${API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: msg.chat.id,
          text:
            "❌ Telegram group limit reached for your plan.\nUpgrade to add more groups.",
        }),
      });
      return;
    }

    // 5️⃣ Attach group
    await prisma.telegramGroup.upsert({
  where: { tgGroupId },

  create: {
    tgGroupId,
    creator: {
      connect: { id: creator.id },
    },
    title: msg.chat.title ?? null,
    username: msg.chat.username ?? null,
    type: msg.chat.type ?? null,
    isConnected: true,
    claimCode: text,
  },

  update: {
    creator: {
      connect: { id: creator.id },
    },
    title: msg.chat.title ?? null,
    username: msg.chat.username ?? null,
    type: msg.chat.type ?? null,
    isConnected: true,
  },
});


    // 6️⃣ Consume claim LAST
    await prisma.telegramGroupClaim.update({
      where: { id: claim.id },
      data: { used: true },
    });

    // 7️⃣ Confirm
    await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text:
          "✅ ClubMint connected successfully.\nYou may now return to your dashboard.",
      }),
    });
  } catch (err) {
    console.error("Telegram webhook error:", err);
  }
}


