"use strict";
// packages/shared/telegram.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramBot = void 0;
exports.createInviteLink = createInviteLink;
exports.sendTelegramMessage = sendTelegramMessage;
exports.kickFromGroup = kickFromGroup;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const node_fetch_1 = __importDefault(require("node-fetch"));
if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
}
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
exports.telegramBot = new node_telegram_bot_api_1.default(BOT_TOKEN, {
    polling: false,
});
/**
 * Create a single-use invite link for a Telegram group.
 * Used when granting access to a subscriber.
 */
async function createInviteLink(tgGroupId) {
    try {
        const res = await (0, node_fetch_1.default)(`${API}/createChatInviteLink`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: Number(tgGroupId),
                member_limit: 1, // one-time use
                creates_join_request: false,
            }),
        });
        const json = (await res.json());
        if (!json.ok || !json.result?.invite_link) {
            throw new Error(`createInviteLink failed: ${JSON.stringify(json)}`);
        }
        return json.result.invite_link;
    }
    catch (err) {
        console.error("❌ createInviteLink error:", err);
        throw err;
    }
}
/**
 * Send a Telegram DM.
 * NOTE:
 * - Will fail silently if user never started the bot
 * - That is expected behavior
 */
async function sendTelegramMessage(tgUserId, text) {
    try {
        const res = await (0, node_fetch_1.default)(`${API}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: tgUserId,
                text,
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }),
        });
        const json = (await res.json());
        if (!json.ok) {
            console.warn("⚠️ sendMessage failed:", tgUserId, json.description);
        }
    }
    catch (err) {
        console.error("❌ sendTelegramMessage error:", err);
    }
}
/**
 * Remove a user from a group.
 * Implemented as:
 *   banChatMember → unbanChatMember
 *
 * This:
 * - Removes user immediately
 * - Allows rejoin later if they pay again
 */
async function kickFromGroup(tgGroupId, tgUserId) {
    try {
        const res = await (0, node_fetch_1.default)(`${API}/banChatMember`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: Number(tgGroupId),
                user_id: tgUserId,
            }),
        });
        const json = (await res.json());
        if (!json.ok) {
            // Expected & safe failures
            if (json.error_code === 400 || // user not found / already left
                json.error_code === 403 // insufficient rights / admin user
            ) {
                console.warn("⚠️ kick skipped:", tgGroupId, tgUserId, json.description);
                return;
            }
            console.error("❌ banChatMember failed:", json);
            return;
        }
        // Unban to allow rejoin later
        await (0, node_fetch_1.default)(`${API}/unbanChatMember`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: Number(tgGroupId),
                user_id: tgUserId,
            }),
        });
    }
    catch (err) {
        console.error(`❌ kickFromGroup error (group=${tgGroupId}, user=${tgUserId})`, err);
    }
}
