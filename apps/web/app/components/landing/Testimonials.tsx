"use client";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

const TESTIMONIALS = [
  {
    quote:
      "ClubMint replaced three different tools we were using. Payments, access control, and renewals just work now.",
    name: "Arjun Rao",
    role: "Telegram community owner",
  },
  {
    quote:
      "We went from manual member approvals to fully automated subscriptions in one afternoon. It feels unreal.",
    name: "Neha Verma",
    role: "Creator & course founder",
  },
  {
    quote:
      "This is the first tool that actually understands how paid communities operate. Clean, reliable, and fast.",
    name: "Kunal Shah",
    role: "Discord server admin",
  },
];

export default function Testimonials() {
  return (
    <SectionWrapper>
      <section className="testimonials">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="testimonials-head"
          >
            <span className="testimonials-eyebrow">Trusted by creators</span>
            <h2 className="testimonials-title">
              Built for people <br />
              running real communities
            </h2>
          </motion.div>

          {/* Grid */}
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="testimonial-card"
              >
                <p className="testimonial-quote">“{t.quote}”</p>

                <footer className="testimonial-footer">
                  <div className="testimonial-meta">
                    <span className="testimonial-name">{t.name}</span>
                    <span className="testimonial-role">{t.role}</span>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>
    </SectionWrapper>
  );
}
