"use client";
import { motion } from "framer-motion";

export default function Pricing() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      id="pricing"
      className="pricing container"
    >
      <h2 className="hero-title" style={{ fontSize: "38px" }}>Pricing</h2>

      <div className="pricing-card">
        <h3 style={{ fontSize: "24px", fontWeight: 700 }}>Free</h3>
        <p style={{ marginTop: "10px", color: "var(--muted)" }}>
          No monthly fees. Pay-as-you-earn.
        </p>

        <a href="/signup" className="pricing-btn">Get started</a>
      </div>
    </motion.section>
  );
}
