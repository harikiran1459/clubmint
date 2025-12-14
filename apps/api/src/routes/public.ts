import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/creator/public/:handle", async (req, res) => {
  try {
    const { handle } = req.params;

    const creator = await prisma.creator.findUnique({
      where: { handle },
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }

    const product = await prisma.product.findFirst({
      where: { creatorId: creator.id },
    });

    if (!product) {
      return res.status(404).json({ error: "No products found" });
    }

    res.json({ creator, product });
  } catch (err) {
    console.error("public creator page error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
