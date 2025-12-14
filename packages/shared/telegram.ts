import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: false, // worker only sends messages, no polling
});

/**
 * Creates a fresh Telegram invite link for a group.
 */
export async function createInviteLink(groupId: string): Promise<string> {
  try {
    // create a unique invite link
    const link = await telegramBot.createChatInviteLink(groupId, {
      member_limit: 1,       // optional: one-time link
      creates_join_request: false,
    });

    // link.invite_link: new versions
    // link.inviteLink: older versions
    return (link.invite_link) as string;
  } catch (err) {
    console.error("createInviteLink ERROR:", err);
    throw err;
  }
}

export async function addUserToGroup(groupId: bigint, userId: number) {
  const res = await fetch(`${API}/inviteChatMember`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: Number(groupId),
      user_id: userId,
    }),
  });

  const data = (await res.json()) as { ok: boolean };
  if (!data.ok) throw new Error(`Telegram addUserToGroup failed: ${JSON.stringify(data)}`);
}

/**
 * Sends a normal Telegram text message.
 */
export async function sendTelegramMessage(userId: number, text: string) {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: userId,
      text,
      parse_mode: "HTML",
    }),
  });
}

export async function removeUserFromGroup(groupId: string, userId: string | number) {
  try {
    // Some libraries use Number conversion; Telegram API expects integer IDs
    const chatId = groupId;
    const tgUserId = Number(userId);

    // First, kick/ban the user (this removes them)
    // `kickChatMember` is deprecated in newer Telegram API; use `banChatMember` if available.
    if (typeof (telegramBot as any).banChatMember === "function") {
      await (telegramBot as any).banChatMember(chatId, tgUserId);
    } else if (typeof (telegramBot as any).kickChatMember === "function") {
      await (telegramBot as any).kickChatMember(chatId, tgUserId);
    } else {
      // fallback: call HTTP method via api
      await (telegramBot as any)._request("banChatMember", { chat_id: chatId, user_id: tgUserId });
    }

    // Optional: unban immediately so they can rejoin after payment is resolved
    if (typeof (telegramBot as any).unbanChatMember === "function") {
      await (telegramBot as any).unbanChatMember(chatId, tgUserId);
    } else {
      await (telegramBot as any)._request("unbanChatMember", { chat_id: chatId, user_id: tgUserId });
    }

    return true;
  } catch (err) {
    console.error("removeUserFromGroup error:", err);
    throw err;
  }
}

export type TelegramUser = {
  tgUserId: number;
  tgUsername: string | null;
  creatorId: string;
};

export type TelegramGroup = {
  tgGroupId: number;
  inviteLink: string;
  creatorId: string;
};

export async function kickFromGroup(groupId: bigint, userId: number) {
  const res = await fetch(`${API}/banChatMember`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: Number(groupId),
      user_id: userId,
    }),
  });

  const data = (await res.json()) as { ok: boolean };
  if (!data.ok) {
    throw new Error(`kickFromGroup failed: ${JSON.stringify(data)}`);
  }
}
