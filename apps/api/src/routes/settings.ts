import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

/**
 * POST /settings/profile
 * Update creator profile (name, bio, profileImage)
 */
router.post("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const { name, bio, profileImage } = req.body;

    // Update USER (name, avatar)
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(profileImage !== undefined && { image: profileImage }),
      },
    });

    // Update CREATOR (bio only)
    const creator = await prisma.creator.update({
      where: { userId },
      data: {
        ...(bio !== undefined && { bio }),
      },
    });

    res.json({ ok: true, user, creator });
  } catch (err) {
    console.error("POST /settings/profile failed:", err);
    res.status(500).json({ ok: false });
  }
});


/**
 * POST /settings/telegram/unlink
 */
// router.post("/telegram/unlink", requireAuth, async (req, res) => {
//   try {
//     const userId = req.userId!;

//     await prisma.creator.update({
//       where: { userId },
//       data: {
//         telegramLinked: false,
//         telegramUserId: null,
//         telegramGroupId: null,
//       },
//     });

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("POST /settings/telegram/unlink failed:", err);
//     res.status(500).json({ ok: false });
//   }
// });

// /**
//  * POST /settings/delete-account
//  * Soft delete creator account
//  */
// router.post("/delete-account", requireAuth, async (req, res) => {
//   try {
//     const userId = req.userId!;

//     await prisma.creator.update({
//       where: { userId },
//       data: {
//         active: false,
//         deletedAt: new Date(),
//       },
//     });

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("POST /settings/delete-account failed:", err);
//     res.status(500).json({ ok: false });
//   }
// });

export default router;
