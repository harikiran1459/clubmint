import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /access/status?checkout=
 * Lightweight access probe for success page
 */
router.get("/status", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const count = await prisma.accessControl.count({
      where: {
        subscription: {
          is: {
            userId,
          },
        },
        status: {
          in: ["active", "pending"],
        },
      },
    });

    return res.json({
      ok: true,
      hasAccess: count > 0,
    });
  } catch (err) {
    console.error("GET /access/status error:", err);
    return res.status(500).json({ ok: false });
  }
});


export default router;