"use client";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="navbar container"
    >
      <div className="logo">ClubMint</div>

      <nav className="nav-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="/docs">Docs</a>
      </nav>

      <a href="/signup" className="nav-cta">Start for free</a>
    </motion.header>
  );
}
