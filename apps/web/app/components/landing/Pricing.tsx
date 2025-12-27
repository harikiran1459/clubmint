"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  PricingPlanUI,
  mapPricingToUI,
} from "../../../lib/plans";

export default function PricingCards({
  currentPlan,
  onUpgrade,
}: {
  currentPlan?: string;
  onUpgrade?: (plan: string) => void;
}) {
  const [plans, setPlans] = useState<PricingPlanUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pricing`
        );
        const json = await res.json();

        if (json.ok) {
          setPlans(mapPricingToUI(json.plans));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="pricing">
        <div className="container">
          <div className="pricing-sub">Loading pricing…</div>
        </div>
      </section>
    );
  }

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
          {plans.map((plan, idx) => {
            const isCurrent = currentPlan === plan.key;
            const isPopular = plan.highlighted;

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`pricing-card ${
                  isPopular ? "popular" : ""
                }`}
              >
                {isPopular && (
                  <div className="pricing-badge">
                    Most popular
                  </div>
                )}

                {isCurrent && (
                  <div className="pricing-current">
                    Current plan
                  </div>
                )}

                <h3 className="pricing-plan">{plan.name}</h3>

                <div className="pricing-price">
                  {plan.price === "₹0" ? (
                   <>
                      <span className="currency">₹</span>
                      {plan.price.replace("₹", "")}
                      <span className="per"> / month</span>
                    </>
                  ) : (
                    <>
                      <span className="currency">₹</span>
                      {plan.price.replace("₹", "")}
                      <span className="per"> / month</span>
                    </>
                  )}
                </div>

                {/* <div className="pricing-commission">
                  {plan.commission}
                </div> */}

                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>

                {onUpgrade && !isCurrent && (
                  <button
                    onClick={() => onUpgrade(plan.key)}
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
