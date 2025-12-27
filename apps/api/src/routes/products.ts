import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";
import { CLUBMINT_PLANS } from "../config/plans";

const prisma = new PrismaClient();
const router = Router();

/* =====================================================
   GET /products
===================================================== */
router.get("/", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
  });

  if (!creator) return res.json({ ok: true, products: [] });

  const products = await prisma.product.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({ ok: true, products });
});

/* =====================================================
   POST /products
===================================================== */
router.post("/", requireAuth, async (req, res) => {
  const { title, description, priceCents, billingInterval } = req.body;

  if (!title || !priceCents) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
    include: { products: true },
  });

  if (!creator) return res.status(400).json({ ok: false });

  const plan = CLUBMINT_PLANS[creator.plan];
  const maxProducts = plan.features.products;

  if (
    Number.isFinite(maxProducts) &&
    creator.products.length >= maxProducts
  ) {
    return res.status(403).json({
      ok: false,
      error: `Your ${plan.name} plan allows only ${maxProducts} products.`,
    });
  }

  const product = await prisma.product.create({
    data: {
      creatorId: creator.id,
      title,
      description,
      priceCents,
      billingInterval,
    },
  });

  res.json({ ok: true, product });
});

/* =====================================================
   POST /products/by-ids  (PUBLIC)
   Used by pricing blocks on public pages
===================================================== */
router.post("/by-ids", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ ok: true, products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
        // optional safety if you add drafts later
        // published: true,
      },
      select: {
        id: true,
        title: true,
        priceCents: true,
        billingInterval: true,
        description: true,
      },
    });

    res.json({ ok: true, products });
  } catch (err) {
    console.error("POST /products/by-ids error:", err);
    res.status(500).json({ ok: false });
  }
});


/* =====================================================
   DELETE /products/:id
===================================================== */
router.delete("/:id", requireAuth, async (req, res) => {
  const creator = await prisma.creator.findUnique({
    where: { userId: req.userId },
  });

  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });

  if (!creator || !product || product.creatorId !== creator.id) {
    return res.status(403).json({ ok: false });
  }

  await prisma.product.delete({ where: { id: product.id } });
  res.json({ ok: true });
});

/* =====================================================
   GET /products/:id
===================================================== */
router.get("/:id", requireAuth, async (req, res) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      creator: { userId: req.userId },
    },
    include: {
      telegramGroups: true,
    },
  });

  if (!product) return res.status(404).json({ ok: false });
  res.json({ ok: true, product });
});

/* =====================================================
   GET /products/:id/available-groups
===================================================== */
router.get("/:id/available-groups", requireAuth, async (req, res) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      creator: { userId: req.userId },
    },
  });

  if (!product) return res.status(404).json({ ok: false });

  const groups = await prisma.telegramGroup.findMany({
    where: {
      creatorId: product.creatorId,
      // isConnected: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const safeGroups = groups.map((g) => ({
  ...g,
  tgGroupId: g.tgGroupId.toString(), // 👈 FIX
}));

res.json({ ok: true, groups: safeGroups });

});

/* =====================================================
   POST /products/:id/access
===================================================== */
router.post("/:id/access", requireAuth, async (req, res) => {
  const { groupIds } = req.body;

  if (!Array.isArray(groupIds)) {
    return res.status(400).json({ ok: false });
  }

  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      creator: { userId: req.userId },
    },
  });

  if (!product) return res.status(404).json({ ok: false });

  const creator = await prisma.creator.findUnique({
    where: { id: product.creatorId },
  });

  const plan = CLUBMINT_PLANS[creator.plan];
  const maxGroups = plan.features.telegramGroups;

  if (
    Number.isFinite(maxGroups) &&
    groupIds.length > maxGroups
  ) {
    return res.status(403).json({
      ok: false,
      error: `Your ${plan.name} plan allows only ${maxGroups} Telegram groups.`,
    });
  }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      telegramGroups: {
        set: groupIds.map((id: string) => ({ id })),
      },
    },
  });

  res.json({ ok: true });
});

export default router;
