import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

/**
 * ---------------------------------------------------------
 * GET /pages  → List all pages for logged-in creator
 * ---------------------------------------------------------
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId },
    });

    if (!creator)
      return res.json({ ok: false, error: "Creator not found", pages: [] });

    const pages = await prisma.creatorPage.findMany({
      where: { creatorId: creator.id },
      include: {
    creator: {
      select: { handle: true },
    },
  },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ ok: true, pages });
  } catch (err) {
    console.error("GET /pages error:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * ---------------------------------------------------------
 * GET /pages/by-id/:id  → Editor loads page by ID
 * ---------------------------------------------------------
 */
router.get("/by-id/:id", requireAuth, async (req, res) => {
  try {
    const page = await prisma.creatorPage.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { handle: true } },
      },
    });

    if (!page)
      return res.status(404).json({ ok: false, error: "Page not found" });

    return res.json({
      ok: true,
      page: {
        ...page,
        creatorHandle: page.creator.handle,
      },
    });
  } catch (err) {
    console.error("GET /pages/by-id error:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * ---------------------------------------------------------
 * POST /pages  → Create or Update a Page
 * ---------------------------------------------------------
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      id,
      slug,
      title,
      themeColor1,
      themeColor2,
      sections,
      published,
    } = req.body;

    if (!slug || !title)
      return res
        .status(400)
        .json({ ok: false, error: "Slug and title are required" });

    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId },
    });

    if (!creator)
      return res.status(400).json({ ok: false, error: "Creator missing" });

    // 🔍 Check for slug uniqueness per creator
    const existing = await prisma.creatorPage.findFirst({
      where: {
        slug,
        creatorId: creator.id,
        NOT: id ? { id } : undefined,
      },
    });

    if (existing) {
      return res.json({
        ok: false,
        error: "Slug already exists — choose a different one",
      });
    }

    let page;

    if (id) {
      // UPDATE
      page = await prisma.creatorPage.update({
        where: { id },
        data: { slug, title, themeColor1, themeColor2, sections, published },
        include: {
          creator: { select: { handle: true } },
        },
      });
    } else {
      // CREATE
      page = await prisma.creatorPage.create({
        data: {
          creatorId: creator.id,
          slug,
          title,
          themeColor1,
          themeColor2,
          sections,
          published: published ?? false,
        },
        include: {
          creator: { select: { handle: true } },
        },
      });
    }

    return res.json({
      ok: true,
      page: {
        ...page,
        creatorHandle: page.creator.handle,
      },
    });
  } catch (err) {
    console.error("POST /pages error:", err);
    return res.json({ ok: false, error: err.message });
  }
});

/**
 * ---------------------------------------------------------
 * DELETE /pages/:id  → Delete page
 * ---------------------------------------------------------
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { userId: req.userId },
    });

    if (!creator)
      return res.status(400).json({ ok: false, error: "Creator not found" });

    const page = await prisma.creatorPage.findUnique({
      where: { id: req.params.id },
    });

    if (!page)
      return res.status(404).json({ ok: false, error: "Page not found" });

    if (page.creatorId !== creator.id)
      return res.status(403).json({ ok: false, error: "Not allowed" });

    await prisma.creatorPage.delete({
      where: { id: req.params.id },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /pages/:id error:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * ---------------------------------------------------------
 * POST /pages/publish/:id  → Publish toggle
 * ---------------------------------------------------------
 */
router.post("/publish/:id", requireAuth, async (req, res) => {
  try {
    const { publish } = req.body;

    const page = await prisma.creatorPage.update({
      where: { id: req.params.id },
      data: { published: publish },
    });

    return res.json({ ok: true, page });
  } catch (err) {
    console.error("POST /pages/publish error:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * ---------------------------------------------------------
 * PUBLIC ROUTE (must be last)
 * GET /pages/:handle/:slug → Public viewer
 * ---------------------------------------------------------
 */
router.get("/:handle/:slug", async (req, res) => {
  const { handle, slug } = req.params;

  try {
    const creator = await prisma.creator.findUnique({
      where: { handle },
    });

    if (!creator) return res.status(404).json({ ok: false });

    const page = await prisma.creatorPage.findFirst({
      where: { creatorId: creator.id, slug, published: true },
      
      select: {
  id: true,
  title: true,
  sections: true,
  themeColor1: true,
  themeColor2: true,
  creator: {
    select: {
      handle: true,
    },
  },
},

    });

    if (!page) return res.status(404).json({ ok: false });

    return res.json({ ok: true,   page: {
    ...page,
    creatorHandle: page.creator.handle,
  }, });
  } catch (err) {
    console.error("PUBLIC PAGE ERROR:", err);
    return res.status(500).json({ ok: false });
  }
});

export default router;
