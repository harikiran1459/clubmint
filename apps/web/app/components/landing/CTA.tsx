"use client";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="cta container"
    >
      <h2 className="hero-title" style={{ fontSize: "42px" }}>
        Ready to launch your community?
      </h2>

      <a href="/signup" className="cta-btn">Create your space</a>
    </motion.section>
  );
}
