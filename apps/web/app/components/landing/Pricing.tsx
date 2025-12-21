"use client";

import { motion } from "framer-motion";
import { CLUBMINT_PLANS } from "../../../lib/plans";

export default function PricingCards({
  currentPlan,
  onUpgrade,
}: {
  currentPlan?: string;
  onUpgrade?: (plan: string) => void;
}) {
  return (
    <section className="pricing">
      <div className="container">
        {/* Header */}
        <div className="pricing-head">
          <span className="pricing-eyebrow">Simple pricing</span>
          <h2 className="pricing-title">
            Start free. <br />
            Upgrade when you grow.
          </h2>
          <p className="pricing-sub">
            No hidden fees. No contracts. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="pricing-grid">
          {Object.entries(CLUBMINT_PLANS).map(([key, plan], idx) => {
            const isCurrent = currentPlan === key;
            const isPopular = key === "starter"; // mark your best plan

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`pricing-card ${isPopular ? "popular" : ""}`}
              >
                {isPopular && (
                  <div className="pricing-badge">Most popular</div>
                )}

                {isCurrent && (
                  <div className="pricing-current">Current plan</div>
                )}

                <h3 className="pricing-plan">{plan.name}</h3>

                <div className="pricing-price">
                  {plan.price === 0 ? (
                    <span className="pricing-free">Free</span>
                  ) : (
                    <>
                      <span className="currency">₹</span>
                      {plan.price}
                      <span className="per">/ month</span>
                    </>
                  )}
                </div>

                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>

                {onUpgrade && !isCurrent && (
                  <button
                    onClick={() => onUpgrade(key)}
                    className={`pricing-cta ${
                      isPopular ? "primary" : "secondary"
                    }`}
                  >
                    Get started
                  </button>
                )}

                {isCurrent && (
                  <div className="pricing-muted">
                    You’re already on this plan
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
