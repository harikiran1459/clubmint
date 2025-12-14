// apps/api/src/routes/auth.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

const JWT_SECRET = process.env.API_JWT_SECRET || process.env.NEXTAUTH_SECRET;
if (!JWT_SECRET) {
  console.warn("API_JWT_SECRET / NEXTAUTH_SECRET not set — auth will fail without a secret.");
}

// SIGNUP -----------------------------------------------------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Generate unique creator handle
    const baseHandle = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    let handle = baseHandle;

    // Ensure handle uniqueness
    while (await prisma.creator.findUnique({ where: { handle } })) {
      handle = `${baseHandle}_${Math.random().toString(36).substring(2, 6)}`;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashed,
        creator: {
          create: {
            handle,
            bio: "",
            pricingPlan: {},
          },
        },
      },
      include: { creator: true },
    });

    return res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        creatorId: user.creator.id,
        creatorHandle: user.creator.handle,   // <-- IMPORTANT
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
});


// LOGIN -------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { creator: true },
    });

    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      {
        userId: user.id,
        creatorId: user.creator?.id ?? null,
        creatorHandle: user.creator?.handle ?? null,   // <-- NEW
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        creatorId: user.creator?.id ?? null,
        creatorHandle: user.creator?.handle ?? null,   // <-- NEW
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});


// CURRENT USER ------------------------------------------------------
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization?.split(" ")[1];
    if (!auth) return res.status(401).json({ error: "No token" });

    const decoded: any = jwt.verify(auth, process.env.JWT_SECRET!);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { creator: true }, // FIXED
    });

    return res.json({ ok: true, user });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});



/**
 * GET /auth/session
 * Header: Authorization: Bearer <token>
 * Response: { ok: true, user } or 401
 */
router.get("/session", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ ok: false, error: "Missing auth" });

    const matches = auth.match(/^Bearer\s+(.*)$/i);
    if (!matches) return res.status(401).json({ ok: false, error: "Invalid auth" });

    const token = matches[1];
    const payload: any = jwt.verify(token, JWT_SECRET!);
    const userId = payload.sub;
    if (!userId) return res.status(401).json({ ok: false, error: "Invalid token" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ ok: false, error: "User not found" });

    return res.json({ ok: true, user });
  } catch (err: any) {
    console.error("Auth session error:", err);
    return res.status(401).json({ ok: false, error: err.message });
  }
});

export default router;
