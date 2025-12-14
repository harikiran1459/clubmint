import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// TEMP local uploads (change to S3 later)
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const uploader = multer({ storage });

router.post("/upload", uploader.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const url = `/uploads/${req.file.filename}`;
  return res.json({ ok: true, url });
});

export default router;
