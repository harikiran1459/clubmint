"use client";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        {/* Brand */}
        <div className="footer-brand">
                  <img
          src="/logo.svg"
          alt="ClubMint"
          className="h-6 w-auto mb-3"
        />

          <p className="footer-desc">
            Monetize your community with automated payments,
            access control, and retention — without backend complexity.
          </p>
        </div>

        {/* Links */}
        <div className="footer-links">
          <div className="footer-col">
            <span className="footer-col-title">Product</span>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how">How it works</a>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Company</span>
            <a href="/about">About</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Support</span>
            <a href="mailto:support@clubmint.com">Contact</a>
            <a href="/docs">Documentation</a>
            <a href="/status">Status</a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ClubMint. All rights reserved.</span>
      </div>
    </footer>
  );
}
