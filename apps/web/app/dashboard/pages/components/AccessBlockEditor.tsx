"use client";
import React, { useEffect, useState } from "react";

const ALL_PLATFORMS = ["telegram", "whatsapp", "instagram", "discord"];

const ICON = {
  telegram: "M10 2L2 8l8 6 8-6-8-6z",
  whatsapp: "M12 2a10 10 0 100 20 10 10 0 000-20z",
  instagram:
    "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z",
  discord:
    "M8 8c-2 0-2 2-2 2h10s0-2-2-2c-1.2 0-2.8.6-3 1-0.2-.4-1.8-1-3-1z",
};

export default function AccessBlockEditor({
  block,
  onChange,
}: {
  block: any;
  onChange: (d: any) => void;
}) {
  const data = block.data || {};

  const [headline, setHeadline] = useState(
    data.headline ?? "Instant Access"
  );
  const [subtext, setSubtext] = useState(
    data.subtext ?? "Get access immediately after purchase"
  );
  const [platforms, setPlatforms] = useState<string[]>(
    data.platforms || []
  );

  // 🔑 Sync editor → page state
  useEffect(() => {
    onChange({
      ...data,
      headline,
      subtext,
      platforms,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headline, subtext, platforms]);

  function toggle(p: string) {
    const next = platforms.includes(p)
      ? platforms.filter((x) => x !== p)
      : [...platforms, p];
    setPlatforms(next);
  }

  return (
    <div className="cm-editor-block space-y-4">
      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Section Headline
        </label>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="w-full mt-2 p-3 rounded-lg border bg-white text-neutral-900 text-lg font-semibold"
          placeholder="Instant Access"
        />
      </div>

      {/* Subtext */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Supporting Text
        </label>
        <input
          value={subtext}
          onChange={(e) => setSubtext(e.target.value)}
          className="w-full mt-2 p-3 rounded-lg border bg-white text-neutral-700"
          placeholder="Explain how access works"
        />
      </div>

      {/* Platforms */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Access Platforms
        </label>

        <div className="flex flex-wrap gap-2">
          {ALL_PLATFORMS.map((p) => {
            const active = platforms.includes(p);
            return (
              <button
                key={p}
                onClick={() => toggle(p)}
                type="button"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border transition
                  ${
                    active
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50"
                  }
                `}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d={ICON[p as keyof typeof ICON]} />
                </svg>
                <span className="text-sm capitalize">{p}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
