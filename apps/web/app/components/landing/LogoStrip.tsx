"use client";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

export default function LogoStrip() {
  return (
    <SectionWrapper>
      <section className="logos">
        <div className="container">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="logos-title"
          >
            Trusted by creators and communities worldwide
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="logos-row"
          >
            {/* Text-based logos = premium early-stage SaaS */}
            <span>Telegram</span>
            <span>Discord</span>
            <span>WhatsApp</span>
            <span>Indie Creators</span>
            <span>Online Communities</span>
          </motion.div>
        </div>
      </section>
    </SectionWrapper>
  );
}
