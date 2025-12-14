"use client";
import React, { useState } from "react";

const ALL_PLATFORMS = ["telegram", "whatsapp", "instagram", "discord"];
const ICON = {
  telegram: "M10 2L2 8l8 6 8-6-8-6z",
  whatsapp: "M12 2a10 10 0 100 20 10 10 0 000-20z",
  instagram: "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z",
  discord: "M8 8c-2 0-2 2-2 2h10s0-2-2-2c-1.2 0-2.8.6-3 1-0.2-.4-1.8-1-3-1z",
};

export default function AccessBlockEditor({ block, onChange }: { block: any; onChange: (d: any) => void; }) {
  const data = block.data || {};
  const [platforms, setPlatforms] = useState<string[]>(data.platforms || []);

  function toggle(p: string) {
    const next = platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p];
    setPlatforms(next);
    onChange({ ...data, platforms: next });
  }

  return (
    <div className="cm-editor-block space-y-3">
      <label className="block text-sm font-medium text-neutral-700">Access Platforms</label>
      <div className="flex flex-wrap gap-2">
        {ALL_PLATFORMS.map((p) => (
          <button key={p} onClick={() => toggle(p)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${platforms.includes(p) ? "bg-purple-600 text-white border-purple-600" : "bg-white text-neutral-900 border-neutral-200"}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={ICON[p as keyof typeof ICON]} /></svg>
            <span className="text-sm">{p}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
