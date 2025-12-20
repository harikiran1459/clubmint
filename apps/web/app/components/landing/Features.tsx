"use client";
import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Payments & subscriptions",
    desc: "Accept recurring payments globally with automatic renewals, retries, invoices, and smart dunning — all handled for you.",
  },
  {
    title: "Automatic access control",
    desc: "Members are instantly added or removed from Telegram, Discord, or WhatsApp based on subscription status.",
  },
  {
    title: "Creator-first analytics",
    desc: "Track revenue, churn, lifetime value, and member activity with clean, real-time dashboards.",
  },
  {
    title: "No backend required",
    desc: "No servers, no webhooks, no cron jobs. Launch a production-ready monetized community without engineering effort.",
  },
  {
    title: "Retention & recovery",
    desc: "Recover failed payments automatically and reduce churn with smart retries and subscription lifecycle handling.",
  },
  {
    title: "Built to scale",
    desc: "From 10 members to 100,000+. ClubMint scales quietly in the background while you focus on growth.",
  },
];

export default function Features() {
  return (
    <section id="features" className="features">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="features-head"
        >
          <span className="features-eyebrow">Everything you need</span>
          <h2 className="features-title">
            A complete monetization stack <br />
            for premium communities
          </h2>
          <p className="features-sub">
            ClubMint handles payments, access, analytics, and retention —
            so you can focus on building your community, not infrastructure.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="feature-card"
            >
              <div className="feature-index">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="feature-content">
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
