"use client";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

const STEPS = [
  {
    title: "Connect your community",
    desc: "Link your Telegram, Discord, or WhatsApp group in seconds. No bots to configure. No permissions mess.",
    tag: "Setup",
  },
  {
    title: "Monetize with confidence",
    desc: "Choose subscriptions or one-time access. We handle payments, renewals, retries, and invoices automatically.",
    tag: "Monetization",
  },
  {
    title: "Automate everything",
    desc: "Members are added or removed instantly based on payment status. Zero manual work. Zero mistakes.",
    tag: "Automation",
  },
];

export default function HowItWorks() {
  return (
    <SectionWrapper>
      <section className="how">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="how-head"
          >
            <span className="how-eyebrow">How it works</span>
            <h2 className="how-title">
              Launch once. <br />
              We handle the rest.
            </h2>
            <p className="how-sub">
              ClubMint replaces custom code, bots, and manual admin work
              with a single, automated monetization layer.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="how-grid">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="how-card"
              >
                <div className="how-card-top">
                  <span className="how-tag">{step.tag}</span>
                  <span className="how-step">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="how-card-title">{step.title}</h3>
                <p className="how-card-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
}
