// apps/api/src/index.ts
import express from "express";
import path from "path";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import telegramRoutes from "./routes/telegram";
import checkoutRouter from "./routes/checkout";
import { stripeWebhookHandler } from "./stripe/webhook";
import "./integrations/telegram";
import creatorRoutes from "./routes/creator";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import publicRoutes from "./routes/public";
import statsRoutes from "./routes/stats";
import subscriptionRoutes from "./routes/subscriptions";
import productRoutes from "./routes/products";
//import paymentRoutes from "./routes/payments";
import settingsRoutes from "./routes/settings";
import pagesRoutes from "./routes/pages";
import telegramWebhookRouter from "./routes/telegram-webhook";
import uploadRoutes from "./routes/upload";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
console.log("JWT_SECRET =", process.env.JWT_SECRET);

// stripe webhook must use raw body and be defined BEFORE other body parsers or with explicit raw middleware
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);

// CORS for frontend
app.use(cors({ origin: process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000" }));

// JSON for normal endpoints
app.use(express.json());
app.use("/", authRoutes);
app.use("/creator", (req, res, next) => {
  console.log("[MOUNT] /creator router hit:", req.method, req.url);
  next();
}, creatorRoutes);
app.use("/creators", creatorRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/pages", pagesRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/products", productRoutes);
//app.use("/payments", paymentRoutes);
app.use("/settings", settingsRoutes);
app.use(statsRoutes);
app.use("/",publicRoutes);
app.use(uploadRoutes);
// static file hosting
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/telegram", telegramRoutes);
app.use("/", telegramWebhookRouter);

// mount checkout router
app.use("/", checkoutRouter);

// health
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, async () => {
  console.log(`API running at http://localhost:${PORT}`);
});
