import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../lib/r2";
import crypto from "crypto";

const router = Router();

/* -------------------------
   CONFIG
-------------------------- */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

/* -------------------------
   MULTER (memory only)
-------------------------- */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      cb(new Error("Invalid file type"));
      return;
    }
    cb(null, true);
  },
});

/* -------------------------
   POST /upload
-------------------------- */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("R2 ENV CHECK", {
  account: !!process.env.R2_ACCOUNT_ID,
  key: !!process.env.R2_ACCESS_KEY_ID,
  secret: !!process.env.R2_SECRET_ACCESS_KEY,
  bucket: !!process.env.R2_BUCKET,
  public: !!process.env.R2_PUBLIC_URL,
});

    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No file" });
    }

    /* -------------------------
       IMAGE COMPRESSION
    -------------------------- */
    const image = sharp(req.file.buffer);

    const metadata = await image.metadata();

    const optimizedBuffer = await image
      .rotate()
      .resize({
        width: metadata.width && metadata.width > 1600 ? 1600 : undefined,
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    /* -------------------------
       FILE NAME
    -------------------------- */
    const id = crypto.randomUUID();
    const key = `images/${id}.webp`;

    /* -------------------------
       UPLOAD TO R2
    -------------------------- */
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: optimizedBuffer,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return res.json({
      ok: true,
      url: publicUrl,
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err.message);
    return res.status(400).json({
      ok: false,
      error: err.message || "Upload failed",
    });
  }
});

export default router;
