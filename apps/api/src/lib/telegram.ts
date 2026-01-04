// apps/api/src/lib/telegram.ts

import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const telegramBot = new TelegramBot(BOT_TOKEN, {
  polling: false,
});

/* ---------------------------------- */
/* Invite Link                         */
/* ---------------------------------- */
export async function createInviteLink(
  tgGroupId: bigint
): Promise<string> {
  const res = await fetch(`${API}/createChatInviteLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: Number(tgGroupId),
      member_limit: 1,
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
}

/* ---------------------------------- */
/* Send DM                             */
/* ---------------------------------- */
export async function sendTelegramMessage(
  tgUserId: number,
  text: string
) {
  try {
    const res = await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: tgUserId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const json = (await res.json()) as any;
    if (!json.ok) {
      console.warn(
        "⚠️ sendMessage failed:",
        tgUserId,
        json.description
      );
    }
  } catch (err) {
    console.error("❌ sendTelegramMessage error:", err);
  }
}

/* ---------------------------------- */
/* Kick user                           */
/* ---------------------------------- */
export async function kickFromGroup(
  tgGroupId: bigint,
  tgUserId: number
) {
  try {
    const res = await fetch(`${API}/banChatMember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: Number(tgGroupId),
        user_id: tgUserId,
      }),
    });

    const json = (await res.json()) as any;

    if (!json.ok) {
      if (json.error_code === 400 || json.error_code === 403) {
        console.warn(
          "⚠️ kick skipped:",
          tgGroupId,
          tgUserId,
          json.description
        );
        return;
      }

      console.error("❌ banChatMember failed:", json);
      return;
    }

    // Unban so they can rejoin later
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
      `❌ kickFromGroup error (group=${tgGroupId}, user=${tgUserId})`,
      err
    );
  }
}
