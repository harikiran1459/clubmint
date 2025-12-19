import express from "express";
import { PrismaClient } from "@prisma/client";
import { handleTelegramUpdate } from "../integrations/telegram";
import fetch from "node-fetch";
import { requireAuth } from "../middleware/auth";

import { CLUBMINT_PLANS } from "../config/plans";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * STEP 1 — Generate Telegram deep link
 * This must use:
 *    /start connect_<creatorId>
 */
router.get("/auth/telegram-link", async (req, res) => {
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ error: "Missing userId" });

  // Find creator profile belonging to this user
  const creator = await prisma.creator.findUnique({
    where: { userId: String(userId) },
  });

  if (!creator) {
    return res.status(404).json({ error: "Creator profile not found for this user" });
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return res.status(500).json({ error: "Bot username missing" });
  }

  // correct deep link format
  const telegramDeepLink = `https://t.me/${botUsername}?start=connect_${creator.id}`;

  return res.json({ url: telegramDeepLink });
});

/**
 * STEP 2 — Telegram webhook
 */
router.post("/webhook", async (req, res) => {
  try {
    await handleTelegramUpdate(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    res.status(500).json({ ok: false });
  }
});

// ---------------------------------------
// GET /telegram/status/:userId
// Returns: telegramUser, telegramGroups, creatorId
// ---------------------------------------
router.get("/status/:userId", async (req, res) => {
  try {
    const userId = String(req.params.userId);

    // 1️⃣ Find TelegramUser linked to this User
    const telegramUser = await prisma.telegramUser.findFirst({
      where: { userId },
    });

    // 2️⃣ Find Creator profile linked to this User
    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    // 3️⃣ If creator exists, fetch groups
    let groups = [];
    if (creator) {
      groups = await prisma.telegramGroup.findMany({
        where: { creatorId: creator.id },
      });
    }

    return res.json({
  ok: true,

  telegramUser: telegramUser
    ? {
        ...telegramUser,
        tgUserId: telegramUser.tgUserId.toString(),
      }
    : null,

  telegramGroups: groups.map((g) => ({
    ...g,
    tgGroupId: g.tgGroupId.toString(),
  })),

  creatorId: creator?.id || null,
});

  } catch (err: any) {
    console.error("Telegram status error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});


// ------------------------------------------------------
// GET GROUP STATS
// ------------------------------------------------------
router.get("/group-stats/:tgGroupId", async (req, res) => {
  try {
    const tgGroupId = req.params.tgGroupId;
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    // 1. Member count
    const countResp = await fetch(
      `https://api.telegram.org/bot${TOKEN}/getChatMemberCount?chat_id=${tgGroupId}`
    );
    const countJson = (await countResp.json()) as any;

    // 2. Bot permissions in the group
    const botResp = await fetch(
      `https://api.telegram.org/bot${TOKEN}/getChatMember?chat_id=${tgGroupId}&user_id=${process.env.TELEGRAM_BOT_ID}`
    );
    const botJson = (await botResp.json()) as any;

    return res.json({
      ok: true,
      memberCount: countJson.result ?? null,
      botStatus: botJson.result?.status,
      botPermissions: botJson.result?.can_restrict_members,
    });
  } catch (err) {
    console.error("Group stats error:", err);
    return res.status(500).json({ ok: false });
  }
});

router.post("/group-test-message", async (req, res) => {
  try {
    const { tgGroupId } = req.body;
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: tgGroupId.toString(),
        text: "🤖 Bot is active and has permission to message this group.",
      }),
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Test message error:", err);
    return res.status(500).json({ ok: false });
  }
});



/**
 * GET /telegram/groups/:creatorId
 * Returns all Telegram groups linked to this creator
 */
router.get("/groups/:creatorId", async (req, res) => {
  try {
    const creatorId = String(req.params.creatorId);

    const groups = await prisma.telegramGroup.findMany({
      where: { creatorId },
    });

    return res.json({
      ok: true,
      groups: groups.map((g) => ({
        ...g,
        tgGroupId: g.tgGroupId.toString(),
      })),
    });
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});


/**
 * POST /telegram/manual-link
 * Body: { creatorId, chatIdOrUsername }
 */
router.post("/manual-link", async (req, res) => {
  try {
    const { creatorId, chatIdOrUsername } = req.body;

    if (!creatorId || !chatIdOrUsername)
      return res.status(400).json({ ok: false, error: "Missing fields" });
    const creator = await prisma.creator.findUnique({
  where: { id: creatorId },
  include: { telegramGroups: true },
});

if (!creator) {
  return res.status(404).json({ ok: false, error: "Creator not found" });
}

const planConfig = CLUBMINT_PLANS[creator.plan];
const maxGroups = planConfig.features.telegramGroups;

if (
  Number.isFinite(maxGroups) &&
  creator.telegramGroups.length >= maxGroups
) {
  return res.status(403).json({
    ok: false,
    error: `Your ${planConfig.name} plan allows only ${maxGroups} Telegram groups. Upgrade to add more.`,
  });
}


    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    const resolveUrl = `https://api.telegram.org/bot${TOKEN}/getChat?chat_id=${encodeURIComponent(
      chatIdOrUsername
    )}`;

    const r = await fetch(resolveUrl);
    const data = await r.json() as { ok: boolean; result?: any };

    if (!data.ok)
      return res.status(400).json({ ok: false, error: "Invalid chat" });

    const chat = data.result;

    const group = await prisma.telegramGroup.upsert({
      where: { tgGroupId: BigInt(chat.id) },
      create: {
        tgGroupId: BigInt(chat.id),
        creatorId,
        inviteLink: "",
        title: chat.title ?? null,
        username: chat.username ?? null,
        type: chat.type ?? null,
        isConnected: true,
      },
      update: {
        creatorId,
        title: chat.title ?? null,
        username: chat.username ?? null,
        type: chat.type ?? null,
        isConnected: true,
      },
    });

    return res.json({
      ok: true,
      group: {
        ...group,
        tgGroupId: group.tgGroupId.toString(),
      },
    });
  } catch (err) {
    console.error("Manual link error:", err);
    res.status(500).json({ ok: false });
  }
});

router.post("/map-groups", async (req, res) => {
  const { productId, groupIds } = req.body;

  if (!productId || !Array.isArray(groupIds)) {
    return res.status(400).json({ ok: false, error: "Invalid body" });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        creator: true,
        telegramGroups: true,
      },
    });

    if (!product) {
      return res.status(404).json({ ok: false, error: "Product not found" });
    }

    const planConfig = CLUBMINT_PLANS[product.creator.plan];

    // 🔒 AUTO-ADD LIMIT ENFORCEMENT
    const maxAutoAdd = 1;

// Free plan → only 1 group per product
if (
  product.creator.plan === "free" &&
  product.telegramGroups.length >= maxAutoAdd
) {
  return res.status(403).json({
    ok: false,
    error: "Free plan allows only 1 Telegram auto-add per product. Upgrade to add more.",
  });
}

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        telegramGroups: {
          set: [],
          connect: groupIds.map((g) => ({ id: g })),
        },
      },
      include: { telegramGroups: true },
    });

    return res.json({ ok: true, product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

router.get("/activity/:creatorId", requireAuth, async (req, res) => {
  const creatorId = req.params.creatorId;

  const logs = await prisma.telegramActivityLog.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json({ ok: true, logs });
});



router.get("/creator/:creatorId/group-mapping", async (req, res) => {
  const creatorId = req.params.creatorId;

  try {
    const products = await prisma.product.findMany({
      where: { creatorId },
      include: {
        telegramGroups: true,
      },
    });

    return res.json({ ok: true, products });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});


/**
 * PATCH /telegram/group/:tgGroupId/disconnect
 */
router.patch("/group/:tgGroupId/disconnect", async (req, res) => {
  try {
    const tgGroupId = BigInt(req.params.tgGroupId);

    await prisma.telegramGroup.update({
      where: { tgGroupId },
      data: { isConnected: false },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Group disconnect error:", err);
    res.status(500).json({ ok: false });
  }
});


// ------------------------------------
// User requests a verification code
// ------------------------------------
router.post("/request-code", async (req, res) => {
  try {
    const { userId, creatorId } = req.body;

    if (!userId || !creatorId)
      return res.status(400).json({ ok: false, error: "Missing fields" });

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    await prisma.telegramVerification.create({
      data: {
        code,
        userId,
        creatorId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      },
    });

    return res.json({ ok: true, code });
  } catch (err) {
    console.error("Request code err:", err);
    return res.status(500).json({ ok: false });
  }
});

router.post("/disconnect/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // find creator
    const creator = await prisma.creator.findUnique({
      where: { userId },
    });

    if (creator) {
      await prisma.telegramGroup.updateMany({
        where: { creatorId: creator.id },
        data: { isConnected: false },
      });
    }

    await prisma.telegramUser.deleteMany({
      where: { userId }
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Disconnect error:", err);
    res.status(500).json({ ok: false });
  }
});



export default router;
