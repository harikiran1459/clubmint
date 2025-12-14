"use client";
import React from "react";

export default function FeaturesSection({ data }) {
  return (
    <section style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto" }}>
      <h2 className="text-3xl font-bold text-center mb-8">What You Get</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.items?.map((item: string, i: number) => (
          <div
            key={i}
            style={{
              background: "#f7f7f7",
              padding: 20,
              borderRadius: 10,
              fontSize: 16,
              lineHeight: 1.4,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
