// "use client";
// import { motion } from "framer-motion";

// export default function Home() {
//   return (
//     <main>
      
      
//       {/* glows */}
//       <div className="glow glow-purple"></div>
//       <div className="glow glow-pink"></div>

//       <img
//       src="./public/squiggly.svg"
//       className="squiggly-shape"
//       alt=""
//       />

//       {/* NAV */}
//       <header className="navbar container">
//         <div className="logo">ClubMint</div>

//         <nav className="nav-links">
//           <a href="#features">Features</a>
//           <a href="#pricing">Pricing</a>
//           <a href="#">Docs</a>
//         </nav>

//         <a href="/login" className="nav-cta">Start for free</a>
//       </header>

//       {/* HERO */}
//       <motion.div 
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//       >
//         <section
//         className="hero container">
//         <h1 className="hero-title fade-up">
//           Build a premium community — <span className="gradient-text">fast</span>.
//         </h1>

//         <p className="hero-sub fade-up-delayed">
//           Launch paid Telegram, Discord & WhatsApp memberships.  
//           Automate billing, access & retention — no backend required.
//         </p>

//         <div className="hero-input-wrap">
//           <input className="hero-input" placeholder="clubmint.com/yourpage" />
//           <a href="/login" className="hero-btn">Get started</a>
//         </div>
//         </section>
//       </motion.div>

//       {/* FEATURES */}
//       <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}>
//         <section
//        id="features" className="features container">
//         <h2 className="hero-title" style={{ fontSize: "38px" }}>Features</h2>

//         <div className="features-grid">
//           <div className="feature-card">
//             <div className="feature-title">Automated billing</div>
//             <div className="feature-desc">Recurring subscriptions with auto-renewals.</div>
//           </div>

//           <div className="feature-card">
//             <div className="feature-title">Instant access control</div>
//             <div className="feature-desc">Auto-add/remove members from Telegram & Discord.</div>
//           </div>

//           <div className="feature-card">
//             <div className="feature-title">Analytics</div>
//             <div className="feature-desc">Revenue, churn & growth insights.</div>
//           </div>
//         </div>
//         </section>
//       </motion.div>

//       {/* PRICING */}
//       <motion.div 
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}>
//         <section
//       id="pricing" className="pricing container">
//         <h2 className="hero-title" style={{ fontSize: "38px" }}>Pricing</h2>

//         <div className="pricing-card">
//           <h3 style={{ fontSize: "24px", fontWeight: 700 }}>Free</h3>
//           <p style={{ marginTop: "10px", color: "var(--muted)" }}>
//             No monthly fees. Pay-as-you-earn.
//           </p>

//           <a href="/login" className="pricing-btn">Get started</a>
//         </div>
//         </section>
//       </motion.div>

//       {/* CTA */}
//       <motion.div 
//       initial={{ opacity: 0, y: 30 }}
//   animate={{ opacity: 1, y: 0 }}
//   transition={{ duration: 0.6 }}>
//     <section
//       className="cta container">
//         <h2 className="hero-title" style={{ fontSize: "42px" }}>
//           Ready to launch your community?
//         </h2>
//         <a href="/signup" className="cta-btn">Create your space</a>
//         </section>
//       </motion.div>

//       {/* FOOTER */}
//       <footer className="footer">© 2025 ClubMint. All rights reserved.</footer>
//     </main>
//   );
// }

import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Pricing from "./components/landing/Pricing";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <main>

      {/* Sublaunch grid background */}
      <div className="grid-bg"></div>

      {/* Glow effects */}
      <div className="glow glow-purple"></div>
      <div className="glow glow-pink"></div>

      {/* Diagonal Sublaunch shape */}
      <img src="/squiggly.svg" className="squiggly-shape" alt="" />

      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
