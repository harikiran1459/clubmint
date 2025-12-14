"use client";
import React from "react";

export default function AccessSection({ data }) {
  const platforms = data.platforms || [];

  const ICONS: any = {
    telegram: "/icons/telegram.png",
    whatsapp: "/icons/whatsapp.png",
    instagram: "/icons/instagram.png",
    discord: "/icons/discord.png",
  };

  return (
    <section style={{ padding: "60px 20px", textAlign: "center" }}>
      <h2 className="text-3xl font-bold mb-6">Access Included</h2>

      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {platforms.map((p: string) => (
          <div key={p} style={{ textAlign: "center" }}>
            <img
              src={ICONS[p]}
              style={{ width: 60, height: 60, marginBottom: 8 }}
            />
            <p className="font-medium capitalize">{p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
