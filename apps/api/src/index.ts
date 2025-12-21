// apps/api/src/index.ts
import express from "express";
import path from "path";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import telegramRoutes from "./routes/telegram";
import checkoutRouter from "./routes/checkout";
// import { stripeWebhookHandler } from "./stripe/webhook";
import "./integrations/telegram";
import creatorRoutes from "./routes/creator";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import publicRoutes from "./routes/public";
import statsRouter from "./routes/stats";
import subscriptionRoutes from "./routes/subscriptions";
import productRoutes from "./routes/products";
//import paymentRoutes from "./routes/payments";
import settingsRoutes from "./routes/settings";
import pagesRoutes from "./routes/pages";
import subscribersRoutes from "./routes/subscribers";
import telegramWebhookRouter from "./routes/telegram-webhook";
import uploadRoutes from "./routes/upload";
import billingRoutes from "./routes/billing";
import payoutsroutes from "./routes/payouts";
import razorpayWebhookRoutes from "./routes/razorpay-webhook";
import earningsRouter from "./routes/earnings";
import meRoutes from "./routes/me";




dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
console.log("JWT_SECRET =", process.env.JWT_SECRET);
const allowedOrigins = [
  "http://localhost:3000",
  "https://theclubmint.com",
  "https://api.theclubmint.com",
  "https://app.theclubmint.com",
   "https://clubmint-web.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// stripe webhook must use raw body and be defined BEFORE other body parsers or with explicit raw middleware
// app.post("/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);

// JSON for normal endpoints
app.use(express.json());
app.use("/", authRoutes);
app.use("/creator", (req, res, next) => {
  console.log("[MOUNT] /creator router hit:", req.method, req.url);
  next();
}, creatorRoutes);
app.use("/creator", creatorRoutes);
app.use("/me", meRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/billing", billingRoutes);
app.use("/payouts", payoutsroutes);
app.use("/webhooks", razorpayWebhookRoutes);
app.use("/pages", pagesRoutes);
app.use("/", earningsRouter);
app.use("/subscriptions", subscriptionRoutes);
app.use("/subscribers", subscribersRoutes);
app.use("/products", productRoutes);
//app.use("/payments", paymentRoutes);
app.use("/settings", settingsRoutes);
app.use("/stats", statsRouter);
app.use("/",publicRoutes);
app.use(uploadRoutes);
// static file hosting
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/telegram", telegramRoutes);
app.use("/", telegramWebhookRouter);

// mount checkout router
app.use("/checkout", checkoutRouter);

// health
app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, async () => {
  console.log(`API running at http://localhost:${PORT}`);
});
