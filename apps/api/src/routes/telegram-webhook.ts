import express from "express";
import { handleTelegramUpdate } from "../integrations/telegram";
import { strictLimiter } from "../middleware/rateLimit";

const router = express.Router();

router.post("/telegram/webhook", strictLimiter, async (req, res) => {
  try {
    await handleTelegramUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;
