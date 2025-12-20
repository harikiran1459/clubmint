"use client";

import { motion } from "framer-motion";
import React from "react";

export default function SectionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // premium easing
      }}
      className="section-wrapper"
    >
      {children}
    </motion.section>
  );
}
