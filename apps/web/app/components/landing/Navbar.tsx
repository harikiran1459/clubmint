"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`nav ${scrolled ? "nav-scrolled" : ""}`}
    >
      <div className="nav-inner container">
        {/* Logo */}
        <a href="/" className="nav-logo flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="ClubMint"
            height={30}
            className="h-9 w-auto"
          />
        </a>



        {/* Links */}
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#how">How it works</a>
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          <a href="/login" className="nav-link subtle">
            Sign in
          </a>
          <a href="/signup" className="nav-btn">
            Get started
          </a>
        </div>
      </div>
    </motion.header>
  );
}
