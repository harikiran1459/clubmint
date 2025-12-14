"use client";
import React from "react";

export default function HeroSection({ data, creator, themeColor }) {
  return (
    <section
      style={{
        padding: "80px 20px",
        textAlign: "center",
        background: `linear-gradient(135deg, ${themeColor} 0%, #000 100%)`,
        color: "white",
      }}
    >
      <h1 className="text-4xl font-bold mb-4">{data.headline}</h1>

      <p className="text-lg opacity-90 mb-6">{data.subheadline}</p>

      {data.image && (
        <img
          src={data.image}
          style={{
            width: 220,
            height: 220,
            objectFit: "cover",
            borderRadius: "50%",
            margin: "0 auto 20px",
            border: "3px solid white",
          }}
        />
      )}

      <a
        href="#pricing"
        className="auth-btn"
        style={{
          background: "white",
          color: "#111",
          padding: "14px 28px",
          borderRadius: 8,
          fontWeight: 600,
          display: "inline-block",
          marginTop: 10,
        }}
      >
        {data.ctaText || "Get Access"}
      </a>
    </section>
  );
}
