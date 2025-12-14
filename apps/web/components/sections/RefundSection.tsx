"use client";
import React from "react";

export default function RefundSection({ data }) {
  return (
    <section style={{ padding: "50px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <h2 className="text-2xl font-semibold mb-3">Refund Policy</h2>
        <p className="text-gray-700">{data.text}</p>
      </div>
    </section>
  );
}
