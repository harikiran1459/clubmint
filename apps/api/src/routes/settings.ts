import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); 

const router = Router();

/**
 * GET /settings/profile/:userId
 */
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    const creator = await prisma.creator.findUnique({
      where: { userId }
    });

    res.json({ ok: true, user, creator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

/**
 * POST /settings/profile/update
 */
router.post("/update", async (req, res) => {
  try {
    const { userId, name, bio } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    const creator = await prisma.creator.update({
      where: { userId },
      data: { bio },
    });

    res.json({ ok: true, user, creator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
