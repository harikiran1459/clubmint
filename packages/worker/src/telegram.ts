// packages/worker/src/telegram.ts

import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function createInviteLink(tgGroupId: bigint) {
  const res = await fetch(`${API}/createChatInviteLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: Number(tgGroupId),
      member_limit: 1,
    }),
  });

  const json = (await res.json()) as any;
  if (!json.ok) throw new Error(json.description);
  return json.result.invite_link;
}

export async function sendTelegramMessage(
  tgUserId: number,
  text: string
) {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: tgUserId,
      text,
    }),
  });
}

export async function kickFromGroup(
  tgGroupId: bigint,
  tgUserId: number
) {
  await fetch(`${API}/banChatMember`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: Number(tgGroupId),
      user_id: tgUserId,
    }),
  });

  await fetch(`${API}/unbanChatMember`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: Number(tgGroupId),
      user_id: tgUserId,
    }),
  });
}
