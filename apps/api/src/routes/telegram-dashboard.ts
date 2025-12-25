// import express from "express";
// import { PrismaClient } from "@prisma/client";
// import fetch from "node-fetch";
// import { requireAuth } from "../middleware/auth";
// import { CLUBMINT_PLANS } from "../config/plans";

// const prisma = new PrismaClient();
// const router = express.Router();

// /* ----------------------------------------------------
//    Helper: get creator from authenticated user
// ---------------------------------------------------- */
// async function getCreator(userId: string) {
//   return prisma.creator.findUnique({
//     where: { userId },
//   });
// }

// /* ----------------------------------------------------
//    GET /telegram/status
// ---------------------------------------------------- */
// router.get("/status", requireAuth, async (req, res) => {
//   try {
//     const creator = await getCreator(req.userId!);

//     const telegramUser = await prisma.telegramUser.findFirst({
//       where: { userId: req.userId },
//     });

//     const groups = creator
//       ? await prisma.telegramGroup.findMany({
//           where: { creatorId: creator.id },
//         })
//       : [];

//     res.json({
//       ok: true,
//       telegramUser: telegramUser
//         ? {
//             ...telegramUser,
//             tgUserId: telegramUser.tgUserId.toString(),
//           }
//         : null,
//       groups: groups.map((g) => ({
//         ...g,
//         tgGroupId: g.tgGroupId.toString(),
//       })),
//     });
//   } catch (err) {
//     console.error("Telegram status error:", err);
//     res.status(500).json({ ok: false });
//   }
// });

// /* ----------------------------------------------------
//    GET /telegram/groups
// ---------------------------------------------------- */
// router.get("/groups", requireAuth, async (req, res) => {
//   const creator = await getCreator(req.userId!);
//   if (!creator) return res.json({ ok: true, groups: [] });

//   const groups = await prisma.telegramGroup.findMany({
//     where: { creatorId: creator.id },
//   });

//   res.json({
//     ok: true,
//     groups: groups.map((g) => ({
//       ...g,
//       tgGroupId: g.tgGroupId.toString(),
//     })),
//   });
// });

// /* ----------------------------------------------------
//    GET /telegram/group-stats/:tgGroupId
// ---------------------------------------------------- */
// router.get("/group-stats/:tgGroupId", requireAuth, async (req, res) => {
//   try {
//     const creator = await getCreator(req.userId!);
//     if (!creator) return res.status(403).json({ ok: false });

//     const group = await prisma.telegramGroup.findUnique({
//       where: { tgGroupId: BigInt(req.params.tgGroupId) },
//     });

//     if (!group || group.creatorId !== creator.id) {
//       return res.status(403).json({ ok: false });
//     }

//     const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

//     const countResp = await fetch(
//       `https://api.telegram.org/bot${TOKEN}/getChatMemberCount?chat_id=${group.tgGroupId}`
//     );
//     const countJson = await countResp.json();

//     const botResp = await fetch(
//       `https://api.telegram.org/bot${TOKEN}/getChatMember?chat_id=${group.tgGroupId}&user_id=${process.env.TELEGRAM_BOT_ID}`
//     );
//     const botJson = await botResp.json();

//     res.json({
//       ok: true,
//       memberCount: countJson.result ?? null,
//       botStatus: botJson.result?.status,
//       botPermissions: botJson.result?.can_restrict_members ?? false,
//     });
//   } catch (err) {
//     console.error("Group stats error:", err);
//     res.status(500).json({ ok: false });
//   }
// });

// /* ----------------------------------------------------
//    POST /telegram/group-test-message
// ---------------------------------------------------- */
// router.post("/group-test-message", requireAuth, async (req, res) => {
//   try {
//     const creator = await getCreator(req.userId!);
//     const { tgGroupId } = req.body;

//     if (!creator) return res.status(403).json({ ok: false });

//     const group = await prisma.telegramGroup.findUnique({
//       where: { tgGroupId: BigInt(tgGroupId) },
//     });

//     if (!group || group.creatorId !== creator.id) {
//       return res.status(403).json({ ok: false });
//     }

//     await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         chat_id: tgGroupId,
//         text: "🤖 Bot is active and has permission to message this group.",
//       }),
//     });

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("Test message error:", err);
//     res.status(500).json({ ok: false });
//   }
// });

// /* ----------------------------------------------------
//    POST /telegram/map-groups
// ---------------------------------------------------- */
// router.post("/map-groups", requireAuth, async (req, res) => {
//   const { productId, groupIds } = req.body;

//   if (!productId || !Array.isArray(groupIds)) {
//     return res.status(400).json({ ok: false });
//   }

//   const product = await prisma.product.findUnique({
//     where: { id: productId },
//     include: { creator: true, telegramGroups: true },
//   });

//   if (!product || product.creator.userId !== req.userId) {
//     return res.status(403).json({ ok: false });
//   }

//   if (
//     product.creator.plan === "free" &&
//     product.telegramGroups.length >= 1
//   ) {
//     return res.status(403).json({
//       ok: false,
//       error: "Free plan allows only 1 Telegram auto-add per product.",
//     });
//   }

//   const updated = await prisma.product.update({
//     where: { id: productId },
//     data: {
//       telegramGroups: {
//         set: [],
//         connect: groupIds.map((id: string) => ({ id })),
//       },
//     },
//     include: { telegramGroups: true },
//   });

//   res.json({ ok: true, product: updated });
// });

// /* ----------------------------------------------------
//    POST /telegram/request-code
// ---------------------------------------------------- */
// router.post("/request-code", requireAuth, async (req, res) => {
//   try {
//     const creator = await getCreator(req.userId!);
//     if (!creator) return res.status(403).json({ ok: false });

//     const code = Math.random().toString(36).substring(2, 8).toUpperCase();

//     await prisma.telegramVerification.create({
//       data: {
//         code,
//         userId: req.userId!,
//         creatorId: creator.id,
//         expiresAt: new Date(Date.now() + 5 * 60 * 1000),
//       },
//     });

//     res.json({ ok: true, code });
//   } catch (err) {
//     console.error("Request code error:", err);
//     res.status(500).json({ ok: false });
//   }
// });

// export default router;


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

    return res.json({
      ok: true,
      connected: true,
      groups: groups.map(g => ({
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
   3️⃣ CONNECT GROUP AFTER CODE IS POSTED
====================================================== */
router.post("/claim-group", requireAuth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ ok: false });
    }

    const claim = await prisma.telegramGroupClaim.findFirst({
      where: {
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!claim) {
      return res.status(400).json({ ok: false, error: "Invalid code" });
    }

    // Find group where this code was posted
    const group = await prisma.telegramGroup.findFirst({
      where: { claimCode: code },
    });

    if (!group) {
      return res.status(404).json({ ok: false, error: "Group not detected yet" });
    }

    await prisma.telegramGroup.update({
      where: { id: group.id },
      data: {
        creatorId: claim.creatorId,
        isConnected: true,
        claimCode: null,
      },
    });

    await prisma.telegramGroupClaim.update({
      where: { id: claim.id },
      data: { used: true },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Claim group error:", err);
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

    const countResp = await fetch(
      `${API}/getChatMemberCount?chat_id=${tgGroupId}`
    );
    const countJson = await countResp.json();

    const botResp = await fetch(
      `${API}/getChatMember?chat_id=${tgGroupId}&user_id=${process.env.TELEGRAM_BOT_ID}`
    );
    const botJson = await botResp.json();

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

    await prisma.telegramGroup.update({
      where: { tgGroupId },
      data: { isConnected: false },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Disconnect group error:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;
