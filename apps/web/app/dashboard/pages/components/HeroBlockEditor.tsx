"use client";
import React, { useState, useEffect } from "react";
import ImageUploader from "../../../../components/ImageUploader";

export default function HeroBlockEditor({ block, onChange }: { block: any; onChange: (d: any) => void; }) {
  const data = block.data || {};
  const [headline, setHeadline] = useState(data.headline || "");
  const [subhead, setSubhead] = useState(data.subhead || "");
  const [ctaText, setCtaText] = useState(data.ctaText || "Get instant access");
  const [image, setImage] = useState<string | null>(data.image || null);

  useEffect(() => {
    onChange({ ...data, headline, subhead, ctaText, image });
  }, [headline, subhead, ctaText, image]);

  return (
    <div className="cm-editor-block space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700">Headline</label>
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Your headline" className="w-full mt-2 p-3 rounded-lg border border-neutral-200 bg-white text-neutral-900" />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Subheadline</label>
        <textarea value={subhead} onChange={(e) => setSubhead(e.target.value)} placeholder="Short supporting line" className="w-full mt-2 p-3 rounded-lg border border-neutral-200 bg-white text-neutral-900 min-h-[70px]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">CTA Button Text</label>
        <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="CTA text" className="w-full mt-2 p-3 rounded-lg border border-neutral-200 bg-white text-neutral-900" />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Hero Image</label>
        <div className="mt-2 p-3 rounded-lg border border-neutral-200 bg-neutral-50">
          <ImageUploader value={image} onChange={(url) => setImage(url)} />
        </div>
        {image && <div className="text-sm text-neutral-500 mt-2">Image uploaded</div>}
      </div>
    </div>
  );
}
