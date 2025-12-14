"use client";
import { motion } from "framer-motion";

const features = [
  {
    title: "Automated billing",
    desc: "Recurring subscriptions with instant renewals.",
  },
  {
    title: "Instant access control",
    desc: "Auto-add/remove members from Telegram & Discord.",
  },
  {
    title: "Creator analytics",
    desc: "Track revenue, churn, earnings and activity.",
  },
];

export default function Features() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      id="features"
      className="features container"
    >
      <h2 className="hero-title" style={{ fontSize: "38px" }}>Features</h2>

      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
