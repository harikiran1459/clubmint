"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="hero container">
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-eyebrow"
      >
        🚀 Launch your paid community in minutes
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="hero-title"
      >
        Build a <span className="gradient-text">premium community</span>
        <br /> without engineering headaches.
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12 }}
        className="hero-sub"
      >
        Launch paid Telegram, Discord & WhatsApp memberships.
        <br />
        Payments, access control & retention — <strong>no backend required</strong>.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18 }}
        className="hero-input-wrap"
      >
        <div className="hero-input-shell">
          <span className="hero-domain">clubmint.com/</span>
          <input
            className="hero-input"
            placeholder="yourpage"
            spellCheck={false}
          />
        </div>

        <a href="/signup" className="hero-btn">
          Get started →
        </a>
      </motion.div>

      {/* Trust / Social Proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="hero-proof"
      >
        <span>Used by creators & communities worldwide</span>
        <div className="hero-proof-dots">
          <span />
          <span />
          <span />
        </div>
      </motion.div>
    </section>
  );
}
