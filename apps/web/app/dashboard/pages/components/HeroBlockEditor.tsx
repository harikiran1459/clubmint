"use client";

import React, { useEffect, useState } from "react";
import ImageUploader from "../../../../components/ImageUploader";

type HeroLink = {
  label: string;
  href: string;
};

export default function HeroBlockEditor({
  block,
  onChange,
}: {
  block: any;
  onChange: (d: any) => void;
}) {
  const data = block.data || {};

  const [headline, setHeadline] = useState(data.headline ?? "");
  const [subhead, setSubhead] = useState(data.subhead ?? "");
  const [ctaText, setCtaText] = useState(
    data.ctaText ?? "Get instant access"
  );
  const [ctaAction, setCtaAction] = useState(
  data.ctaAction || "scroll_to_pricing"
);
const [ctaUrl, setCtaUrl] = useState(data.ctaUrl || "");


  // background
  const [backgroundType, setBackgroundType] = useState<
    "gradient" | "image"
  >(data.backgroundType ?? "gradient");
  const [backgroundImage, setBackgroundImage] = useState<
    string | undefined
  >(data.backgroundImage);

  // foreground hero image
  const [heroImage, setHeroImage] = useState<string | undefined>(
    data.heroImage
  );
  const [heroImageFit, setHeroImageFit] = useState<
    "contain" | "cover"
  >(data.heroImageFit ?? "contain");
  const [heroImageAlign, setHeroImageAlign] = useState<
    "left" | "center" | "right"
  >(data.heroImageAlign ?? "right");

  // topbar links
  const [links, setLinks] = useState<HeroLink[]>(
    data.links ?? [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ]
  );

  // ------------------------------------------------
  // Sync editor → page state
  // ------------------------------------------------
  useEffect(() => {
    onChange({
      ...data,
      headline,
      subhead,
      ctaText,
      ctaAction,
      ctaUrl,
      backgroundType,
      backgroundImage,
      heroImage,
      heroImageFit,
      heroImageAlign,
      links,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    headline,
    subhead,
    ctaText,
    ctaAction,
    ctaUrl,
    backgroundType,
    backgroundImage,
    heroImage,
    heroImageFit,
    heroImageAlign,
    links,
  ]);

  // ------------------------------------------------
  // UI
  // ------------------------------------------------
  return (
    <div className="cm-editor-block space-y-6">
      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Headline
        </label>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="w-full mt-2 p-3 rounded-lg border bg-white text-neutral-900"
          placeholder="Your main promise"
        />
      </div>

      {/* Subheadline */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Subheadline
        </label>
        <textarea
          value={subhead}
          onChange={(e) => setSubhead(e.target.value)}
          className="w-full mt-2 p-3 rounded-lg border bg-white text-neutral-900 min-h-[80px]"
          placeholder="Short supporting explanation"
        />
      </div>

      {/* CTA */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          CTA Button Text
        </label>
        <input
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          className="w-full mt-2 p-3 rounded-lg border bg-white text-neutral-900"
        />
      </div>
      <div className="space-y-2">
  <label className="text-sm font-medium text-neutral-700">
    CTA Action
  </label>

  <select
    value={ctaAction}
    onChange={(e) => setCtaAction(e.target.value)}
    className="w-full p-3 rounded-lg border bg-white text-neutral-900"
  >
    <option value="scroll_to_pricing">Scroll to Pricing</option>
    <option value="scroll_to_features">Scroll to Features</option>
    <option value="external_link">External Link</option>
  </select>

  {ctaAction === "external_link" && (
    <input
      value={ctaUrl}
      onChange={(e) => setCtaUrl(e.target.value)}
      placeholder="https://example.com"
      className="w-full p-3 rounded-lg border bg-white text-neutral-900"
    />
  )}
</div>


      {/* Background */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700">
          Hero Background
        </label>

        <div className="flex gap-2">
          {(["gradient", "image"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setBackgroundType(t)}
              className={`px-4 py-2 rounded border text-sm ${
                backgroundType === t
                  ? "bg-purple-600 text-white"
                  : "bg-white text-neutral-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {backgroundType === "image" && (
          <div className="mt-2">
            <ImageUploader
              currentUrl={backgroundImage}
              onChange={(url: string) => setBackgroundImage(url)}
            />

            {backgroundImage && (
              <button
                onClick={() => setBackgroundImage(undefined)}
                className="mt-2 text-sm text-red-600"
              >
                Remove background image
              </button>
            )}
          </div>
        )}
      </div>

      {/* Foreground image */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700">
          Hero Foreground Image
        </label>

        <ImageUploader
          currentUrl={heroImage}
          onChange={(url: string) => setHeroImage(url)}
        />

        {heroImage && (
          <>
            {/* alignment */}
            <div className="flex gap-2 mt-3">
              {(["left", "center", "right"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setHeroImageAlign(pos)}
                  className={`px-3 py-2 rounded border text-sm ${
                    heroImageAlign === pos
                      ? "bg-purple-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            {/* fit */}
            <div className="flex gap-2 mt-2">
              {(["contain", "cover"] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => setHeroImageFit(fit)}
                  className={`px-3 py-2 rounded border text-sm ${
                    heroImageFit === fit
                      ? "bg-purple-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>

            <button
              onClick={() => setHeroImage(undefined)}
              className="mt-2 text-sm text-red-600"
            >
              Remove hero image
            </button>
          </>
        )}
      </div>

      {/* Topbar links */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700">
          Topbar Links
        </label>

        {links.map((l, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={l.label}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], label: e.target.value };
                setLinks(next);
              }}
              className="flex-1 p-2 rounded border bg-white w-1"
              placeholder="Label"
            />
            <input
              value={l.href}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], href: e.target.value };
                setLinks(next);
              }}
              className="flex-1 p-2 rounded border bg-white"
              placeholder="#section"
            />
            <button
              onClick={() =>
                setLinks(links.filter((_, idx) => idx !== i))
              }
              className="px-3 text-red-600"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={() =>
            setLinks([...links, { label: "Link", href: "#" }])
          }
          className="text-sm text-purple-600"
        >
          + Add link
        </button>
      </div>
    </div>
  );
}
