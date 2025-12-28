// apps/api/src/routes/telegram.ts

import express from "express";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { requireAuth } from "../middleware/auth";
import crypto from "crypto";

const prisma = new PrismaClient();
const router = express.Router();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN");

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/* ======================================================
   1️⃣ CREATOR TELEGRAM STATUS
====================================================== */
router.get("/status", requireAuth, async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId! },
    });

    if (!creator) {
      return res.json({ ok: true, connected: false });
    }

    const groups = await prisma.telegramGroup.findMany({
      where: { creatorId: creator.id },
    });

    const connectedGroups = groups.filter(g => g.isConnected);

return res.json({
  ok: true,
  connected: connectedGroups.length > 0,
  groups: connectedGroups.map(g => ({
    ...g,
    tgGroupId: g.tgGroupId.toString(),
  })),
});

  } catch (err) {
    console.error("Telegram status error:", err);
    res.status(500).json({ ok: false });
  }
});

/* ======================================================
   2️⃣ GENERATE GROUP CLAIM CODE (SUBLAUNCH STYLE)
====================================================== */
router.post("/claim-code", requireAuth, async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId! },
    });

    if (!creator) {
      return res.status(403).json({ ok: false });
    }

    const code = `CLUBMINT-${crypto.randomBytes(4).toString("hex")}`;
    await prisma.telegramGroupClaim.updateMany({
  where: {
    creatorId: creator.id,
    used: false,
    expiresAt: { gt: new Date() },
  },
  data: { used: true },
});


    await prisma.telegramGroupClaim.create({
      data: {
        creatorId: creator.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });

    return res.json({ ok: true, code });
  } catch (err) {
    console.error("Generate claim code error:", err);
    res.status(500).json({ ok: false });
  }
});

/* ======================================================
   4️⃣ LIST CREATOR GROUPS (UI)
====================================================== */
router.get("/groups", requireAuth, async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId! },
    });

    if (!creator) return res.json({ ok: true, groups: [] });

    const groups = await prisma.telegramGroup.findMany({
      where: { creatorId: creator.id },
    });

    return res.json({
      ok: true,
      groups: groups.map(g => ({
        ...g,
        tgGroupId: g.tgGroupId.toString(),
      })),
    });
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ ok: false });
  }
});

/* ======================================================
   5️⃣ GROUP STATS (ADMIN CHECK)
====================================================== */
router.get("/group-stats/:tgGroupId", requireAuth, async (req, res) => {
  try {
    const tgGroupId = req.params.tgGroupId;
    const group = await prisma.telegramGroup.findFirst({
  where: {
    tgGroupId: BigInt(req.params.tgGroupId),
    creator: { userId: req.userId! },
  },
});

if (!group) {
  return res.status(403).json({ ok: false });
}

    const countResp = await fetch(
      `${API}/getChatMemberCount?chat_id=${tgGroupId}`
    );
    const countJson = await countResp.json();

    const botResp = await fetch(
      `${API}/getChatMember?chat_id=${tgGroupId}&user_id=${process.env.TELEGRAM_BOT_ID}`
    );
    const botJson = await botResp.json();
    if (!countJson.ok || !botJson.ok) {
  return res.json({
    ok: true,
    memberCount: null,
    botStatus: null,
    botPermissions: false,
  });
}


    return res.json({
      ok: true,
      memberCount: countJson.result ?? null,
      botStatus: botJson.result?.status,
      botPermissions: botJson.result?.can_restrict_members,
    });
  } catch (err) {
    console.error("Group stats error:", err);
    res.status(500).json({ ok: false });
  }
});

/* ======================================================
   6️⃣ DISCONNECT GROUP
====================================================== */
router.patch("/group/:tgGroupId/disconnect", requireAuth, async (req, res) => {
  try {
    const tgGroupId = BigInt(req.params.tgGroupId);

    const creator = await prisma.creator.findUnique({
  where: { userId: req.userId! },
});
if (!creator) {
  return res.status(403).json({ ok: false });
}

await prisma.telegramGroup.updateMany({
  where: {
    tgGroupId,
    creatorId: creator.id,
  },
  data: { isConnected: false },
});


    res.json({ ok: true });
  } catch (err) {
    console.error("Disconnect group error:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;
