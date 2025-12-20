"use client";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="cta">
      {/* Background glow */}
      <div className="cta-glow cta-glow-purple" />
      <div className="cta-glow cta-glow-pink" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="cta-inner container"
      >
        <span className="cta-eyebrow">Get started in minutes</span>

        <h2 className="cta-title">
          Turn your community <br />
          into a real business.
        </h2>

        <p className="cta-sub">
          Payments, access control, and retention — all handled automatically.
          <br />
          Launch today. Scale without limits.
        </p>

        <div className="cta-actions">
          <a href="/signup" className="cta-btn primary">
            Create your space →
          </a>
          <a href="#features" className="cta-btn secondary">
            See how it works
          </a>
        </div>

        <div className="cta-foot">
          Free to start • No credit card required
        </div>
      </motion.div>
    </section>
  );
}
