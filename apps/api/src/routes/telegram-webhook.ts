//apps/api/src/routes/telegram-webhook.ts

import express from "express";
import { handleTelegramUpdate } from "../integrations/telegram";

const router = express.Router();

/**
 * Telegram webhook
 * IMPORTANT:
 * - NEVER rate limit
 * - NEVER return non-200
 * - ALWAYS be fast
 */
router.post("/telegram/webhook", async (req, res) => {
  try {
    // Process update asynchronously
    handleTelegramUpdate(req.body);
  } catch (err) {
    // Log but NEVER fail Telegram
    console.error("Telegram webhook error:", err);
  }

  // Telegram requires 200 OK always
  res.sendStatus(200);
});

export default router;
