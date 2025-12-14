"use client";
import React from "react";

export default function TestimonialsSection({ data }) {
  const items = data.items || [];

  return (
    <section style={{ padding: "70px 20px", maxWidth: 900, margin: "0 auto" }}>
      <h2 className="text-3xl font-bold text-center mb-10">Testimonials</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {items.map((t, i) => (
          <div
            key={i}
            style={{
              background: "white",
              padding: 25,
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0,0,0,0.07)",
            }}
          >
            <p style={{ fontStyle: "italic", marginBottom: 12 }}>
              “{t.text}”
            </p>
            <p style={{ fontWeight: 600 }}>— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
