// apps/web/app/page.tsx

import type { Metadata } from "next";

import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import LogoStrip from "./components/landing/LogoStrip";
import Features from "./components/landing/Features";
import HowItWorks from "./components/landing/HowItWorks";
import Testimonials from "./components/landing/Testimonials";
import Pricing from "./components/landing/Pricing";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";

/* =========================
   SEO METADATA
========================= */

export const metadata: Metadata = {
  title: {
    default: "ClubMint — Monetize your community effortlessly",
    template: "%s · ClubMint",
  },
  description:
    "ClubMint helps creators monetize Telegram, Discord, and WhatsApp communities with automated payments, access control, and retention — no backend required.",

  keywords: [
    "community monetization",
    "telegram paid groups",
    "discord subscriptions",
    "creator monetization platform",
    "paid communities",
    "membership platform",
  ],

  openGraph: {
    title: "ClubMint — Monetize your community effortlessly",
    description:
      "Launch paid Telegram, Discord & WhatsApp communities with automated payments, access control, and retention.",
    url: "https://clubmint.com",
    siteName: "ClubMint",
    images: [
      {
        url: "/og.png", // we’ll define this next
        width: 1200,
        height: 630,
        alt: "ClubMint — Monetize your community",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "ClubMint — Monetize your community effortlessly",
    description:
      "Automated payments, access control, and retention for paid Telegram, Discord & WhatsApp communities.",
    images: ["../public/og.png"],
  },

  metadataBase: new URL("https://clubmint.com"),
};

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Background grid */}
      <div className="grid-bg" />

      {/* Ambient glows */}
      <div className="glow glow-purple" />
      <div className="glow glow-pink" />

      {/* Decorative accent */}
      <img
        src="/squiggly.svg"
        className="squiggly-shape"
        alt=""
        aria-hidden
      />

      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
