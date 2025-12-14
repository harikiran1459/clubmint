"use client";
import React from "react";

export default function FAQSection({ data }) {
  const items = data.items || [];

  return (
    <section style={{ padding: "70px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

      <div className="space-y-6">
        {items.map((faq, i) => (
          <div
            key={i}
            style={{
              background: "#f8f8f8",
              padding: 18,
              borderRadius: 10,
            }}
          >
            <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
            <p className="text-gray-700">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
