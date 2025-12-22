import express from "express";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { requireAuth } from "../middleware/auth";
import { CLUBMINT_PLANS } from "../config/plans";

const prisma = new PrismaClient();
const router = express.Router();

/* ----------------------------------------------------
   Helper: get creator from authenticated user
---------------------------------------------------- */
async function getCreator(userId: string) {
  return prisma.creator.findUnique({
    where: { userId },
  });
}

/* ----------------------------------------------------
   GET /telegram/status
---------------------------------------------------- */
router.get("/status", requireAuth, async (req, res) => {
  try {
    const creator = await getCreator(req.userId!);

    const telegramUser = await prisma.telegramUser.findFirst({
      where: { userId: req.userId },
    });

    const groups = creator
      ? await prisma.telegramGroup.findMany({
          where: { creatorId: creator.id },
        })
      : [];

    res.json({
      ok: true,
      telegramUser: telegramUser
        ? {
            ...telegramUser,
            tgUserId: telegramUser.tgUserId.toString(),
          }
        : null,
      groups: groups.map((g) => ({
        ...g,
        tgGroupId: g.tgGroupId.toString(),
      })),
    });
  } catch (err) {
    console.error("Telegram status error:", err);
    res.status(500).json({ ok: false });
  }
});

/* ----------------------------------------------------
   GET /telegram/groups
---------------------------------------------------- */
router.get("/groups", requireAuth, async (req, res) => {
  const creator = await getCreator(req.userId!);
  if (!creator) return res.json({ ok: true, groups: [] });

  const groups = await prisma.telegramGroup.findMany({
    where: { creatorId: creator.id },
  });

  res.json({
    ok: true,
    groups: groups.map((g) => ({
      ...g,
      tgGroupId: g.tgGroupId.toString(),
    })),
  });
});

/* ----------------------------------------------------
   GET /telegram/group-stats/:tgGroupId
---------------------------------------------------- */
router.get("/group-stats/:tgGroupId", requireAuth, async (req, res) => {
  try {
    const creator = await getCreator(req.userId!);
    if (!creator) return res.status(403).json({ ok: false });

    const group = await prisma.telegramGroup.findUnique({
      where: { tgGroupId: BigInt(req.params.tgGroupId) },
    });

    if (!group || group.creatorId !== creator.id) {
      return res.status(403).json({ ok: false });
    }

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    const countResp = await fetch(
      `https://api.telegram.org/bot${TOKEN}/getChatMemberCount?chat_id=${group.tgGroupId}`
    );
    const countJson = await countResp.json();

    const botResp = await fetch(
      `https://api.telegram.org/bot${TOKEN}/getChatMember?chat_id=${group.tgGroupId}&user_id=${process.env.TELEGRAM_BOT_ID}`
    );
    const botJson = await botResp.json();

    res.json({
      ok: true,
      memberCount: countJson.result ?? null,
      botStatus: botJson.result?.status,
      botPermissions: botJson.result?.can_restrict_members ?? false,
    });
  } catch (err) {
    console.error("Group stats error:", err);
    res.status(500).json({ ok: false });
  }
});

/* ----------------------------------------------------
   POST /telegram/group-test-message
---------------------------------------------------- */
router.post("/group-test-message", requireAuth, async (req, res) => {
  try {
    const creator = await getCreator(req.userId!);
    const { tgGroupId } = req.body;

    if (!creator) return res.status(403).json({ ok: false });

    const group = await prisma.telegramGroup.findUnique({
      where: { tgGroupId: BigInt(tgGroupId) },
    });

    if (!group || group.creatorId !== creator.id) {
      return res.status(403).json({ ok: false });
    }

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: tgGroupId,
        text: "🤖 Bot is active and has permission to message this group.",
      }),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Test message error:", err);
    res.status(500).json({ ok: false });
  }
});

/* ----------------------------------------------------
   POST /telegram/map-groups
---------------------------------------------------- */
router.post("/map-groups", requireAuth, async (req, res) => {
  const { productId, groupIds } = req.body;

  if (!productId || !Array.isArray(groupIds)) {
    return res.status(400).json({ ok: false });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { creator: true, telegramGroups: true },
  });

  if (!product || product.creator.userId !== req.userId) {
    return res.status(403).json({ ok: false });
  }

  if (
    product.creator.plan === "free" &&
    product.telegramGroups.length >= 1
  ) {
    return res.status(403).json({
      ok: false,
      error: "Free plan allows only 1 Telegram auto-add per product.",
    });
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      telegramGroups: {
        set: [],
        connect: groupIds.map((id: string) => ({ id })),
      },
    },
    include: { telegramGroups: true },
  });

  res.json({ ok: true, product: updated });
});

/* ----------------------------------------------------
   POST /telegram/request-code
---------------------------------------------------- */
router.post("/request-code", requireAuth, async (req, res) => {
  try {
    const creator = await getCreator(req.userId!);
    if (!creator) return res.status(403).json({ ok: false });

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    await prisma.telegramVerification.create({
      data: {
        code,
        userId: req.userId!,
        creatorId: creator.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    res.json({ ok: true, code });
  } catch (err) {
    console.error("Request code error:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;
