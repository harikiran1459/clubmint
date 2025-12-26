// packages/shared/telegram.ts

import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Shared Telegram bot instance
 * - NO polling
 * - Used only by workers / helpers
 */
export const telegramBot = new TelegramBot(BOT_TOKEN, {
  polling: false,
});

/* ============================================================
   INVITE LINKS (AUTO-JOIN FLOW)
============================================================ */

/**
 * Create a single-use invite link for a Telegram group.
 * Used when granting access to a subscriber.
 */
export async function createInviteLink(
  tgGroupId: bigint
): Promise<string> {
  try {
    const res = await fetch(`${API}/createChatInviteLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: Number(tgGroupId),
        member_limit: 1, // one-time use
        creates_join_request: false,
      }),
    });

    const json = (await res.json()) as any;

    if (!json.ok || !json.result?.invite_link) {
      throw new Error(
        `createInviteLink failed: ${JSON.stringify(json)}`
      );
    }

    return json.result.invite_link;
  } catch (err) {
    console.error("❌ createInviteLink error:", err);
    throw err;
  }
}

/* ============================================================
   MESSAGING
============================================================ */

/**
 * Send a Telegram DM.
 * NOTE:
 * - Will fail silently if user never started the bot
 * - That is expected behavior
 */
export async function sendTelegramMessage(
  tgUserId: number,
  text: string
) {
  try {
    await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: tgUserId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("❌ sendTelegramMessage error:", err);
  }
}

/* ============================================================
   KICK / REVOKE ACCESS
============================================================ */

/**
 * Remove a user from a group.
 * Implemented as:
 *   banChatMember → unbanChatMember
 *
 * This:
 * - Removes user immediately
 * - Allows rejoin later if they pay again
 */
export async function kickFromGroup(
  tgGroupId: bigint,
  tgUserId: number
) {
  try {
    // 1️⃣ Ban (kick)
    const banRes = await fetch(`${API}/banChatMember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: Number(tgGroupId),
        user_id: tgUserId,
      }),
    });

    const banJson = (await banRes.json()) as any;
    if (!banJson.ok) {
      throw new Error(
        `banChatMember failed: ${JSON.stringify(banJson)}`
      );
    }

    // 2️⃣ Immediately unban (so they can rejoin later)
    await fetch(`${API}/unbanChatMember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: Number(tgGroupId),
        user_id: tgUserId,
      }),
    });

  } catch (err) {
    console.error(
      `❌ kickFromGroup error (group=${tgGroupId}, user=${tgUserId}):`,
      err
    );
    throw err;
  }
}

/* ============================================================
   TYPES (OPTIONAL EXPORTS)
============================================================ */

export type TelegramInvite = {
  tgGroupId: bigint;
  inviteLink: string;
};

export type TelegramUser = {
  tgUserId: number;
  tgUsername: string | null;
};