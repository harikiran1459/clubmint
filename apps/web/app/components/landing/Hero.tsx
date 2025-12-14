"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="hero container"
    >
      <h1 className="hero-title">
        Build a premium community — <span className="gradient-text">fast</span>.
      </h1>

      <p className="hero-sub">
        Launch paid Telegram, Discord & WhatsApp memberships.
        Automate billing, access & retention — no backend needed.
      </p>

      <div className="hero-input-wrap">
        <input className="hero-input" placeholder="clubmint.com/yourpage" />
        <a href="/signup" className="hero-btn">Get started</a>
      </div>
    </motion.section>
  );
}
