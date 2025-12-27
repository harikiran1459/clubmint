import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth, requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /creators/me
 * Returns creator profile for the logged-in user.
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId },
    });

    return res.json({
      ok: true,
      creator: creator || null,
    });
  } catch (err) {
    console.error("Creator /me error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /creators/by-user/:userId
 * REQUIRED FOR INTEGRATIONS PAGE
 */
router.get("/by-user/:userId", async (req, res) => {
  try {
    const userId = String(req.params.userId);

    const creator = await prisma.creator.findUnique({
  where: { userId },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true, // 🔑 THIS WAS MISSING
      },
    },
  },
});


    return res.json({
      ok: true,
  creator,
  userId,
    });
  } catch (err: any) {
    console.error("Creator by-user error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /creators/integrations
 * Deprecated for Telegram — DO NOT USE TELEGRAM_GROUP_ID NOW
 * (Left for compatibility; remove if no longer needed)
 */
// router.post("/integrations", requireAuth, async (req, res) => {
//   try {
//     const { telegramGroupId } = req.body;

//     const creator = await prisma.creator.update({
//       where: { userId: req.userId },
//       data: { telegramGroupId },
//     });

//     return res.json({ ok: true, creator });
//   } catch (err) {
//     console.error("Creator integrations update error:", err);
//     return res.status(500).json({ ok: false, error: "Server error" });
//   }
// });

/**
 * POST /creator/onboarding
 * Creates Creator profile + default Membership product
 */
// router.post("/onboarding", auth, async (req, res) => {
//   try {
//     const userId = (req as any).userId;
//     const { handle, bio, priceCents } = req.body;

//     if (!handle || !priceCents) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // 1. Check if the creator profile already exists
//     let creator = await prisma.creator.findUnique({
//       where: { userId },
//     });

//     // 2. Create if missing
//     if (!creator) {
//       creator = await prisma.creator.create({
//         data: {
//           userId,
//           handle,
//           bio: bio ?? "",
//         },
//       });

//       // Create default membership product
//       await prisma.product.create({
//         data: {
//           creatorId: creator.id,
//           title: "Membership Access",
//           description: bio ?? "",
//           priceCents,
//           currency: "usd",
//           billingInterval: "month",
//         },
//       });
//     }

//     return res.json({
//       ok: true,
//       creator,
//       message: "Creator onboarded successfully",
//     });
//   } catch (err) {
//     console.error("Creator onboarding error:", err);
//     return res.status(500).json({ ok: false, error: "Server error" });
//   }
// });

router.post("/onboard", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { handle, bio } = req.body;

    if (!handle) {
      return res.status(400).json({ ok: false, error: "Handle is required" });
    }

    // 1️⃣ Ensure user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creator: true },
    });

    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    // 2️⃣ Prevent double creator creation
    if (user.creator) {
      return res.json({
        ok: true,
        creator: user.creator,
        alreadyCreator: true,
      });
    }

    // 3️⃣ Ensure handle uniqueness
    const existing = await prisma.creator.findUnique({
      where: { handle },
    });

    if (existing) {
      return res
        .status(400)
        .json({ ok: false, error: "Handle already taken" });
    }

    // 4️⃣ Create creator
    const creator = await prisma.creator.create({
      data: {
        userId,
        handle,
        bio: bio ?? "",
        plan: "free",
        commissionPct: 10, // default
      },
    });

    return res.json({
      ok: true,
      creator,
    });
  } catch (err) {
    console.error("Creator onboarding error:", err);
    return res.status(500).json({ ok: false, error: "Onboarding failed" });
  }
});

export default router;
