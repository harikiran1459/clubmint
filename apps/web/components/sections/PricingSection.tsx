"use client";
import React from "react";

export default function PricingSection({ data, product, creator, page }) {
  const plans = data.plans || [];
  const currency = data.currency || "USD";

  return (
    <section
      id="pricing"
      style={{ padding: "80px 20px", background: "#fafafa" }}
    >
      <h2 className="text-3xl font-bold text-center mb-2">Pricing</h2>
      <p className="text-center text-gray-500 mb-10">
        Choose a plan that fits you
      </p>

      <div
        className="grid gap-8"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {plans.map((plan, i) => (
          <div
            key={i}
            style={{
              background: "white",
              padding: 30,
              borderRadius: 14,
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.05)",
              textAlign: "center",
            }}
          >
            <h3 className="text-xl font-semibold capitalize mb-2">
              {plan.interval}
            </h3>

            <p className="text-4xl font-bold mb-6">
              {currency} {plan.amount}
            </p>

            <button
              className="auth-btn"
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 10,
              }}
              onClick={() => {
                window.location.href = `/checkout?productId=${product.id}&creator=${creator.handle}&pageId=${page.id}&interval=${plan.interval}`;
              }}
            >
              Get Access →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
