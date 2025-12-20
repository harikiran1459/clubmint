"use client";
import React, { useEffect, useState } from "react";
import ImageUploader from "../../../../components/ImageUploader";

type FeatureItem = {
  title: string;
  description?: string;
  image?: string;
};

export default function FeaturesBlockEditor({
  block,
  onChange,
}: {
  block: any;
  onChange: (d: any) => void;
}) {
  const data = block.data || {};

  const [layout, setLayout] = useState<"grid" | "split">(
    data.layout ?? "grid"
  );

  const [items, setItems] = useState<FeatureItem[]>(
    data.items ?? []
  );

  // 🔑 IMPORTANT: sync editor state when block changes
  useEffect(() => {
    setLayout(block.data?.layout ?? "grid");
    setItems(block.data?.items ?? []);
  }, [block.data?.layout, block.data?.items]);

  function apply(nextItems = items, nextLayout = layout) {
    setItems(nextItems);
    setLayout(nextLayout);
    onChange({
      ...data,
      items: nextItems,
      layout: nextLayout,
    });
  }

  function addFeature() {
    apply([
      ...items,
      {
        title: "Feature title",
        description: "Short benefit-driven description",
      },
    ]);
  }

  function updateItem(i: number, patch: Partial<FeatureItem>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    apply(next);
  }

  function removeItem(i: number) {
    apply(items.filter((_, idx) => idx !== i));
  }

  return (
    <div className="cm-editor-block space-y-6">
      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Layout
        </label>
        <div className="flex gap-2 mt-2">
          {(["grid", "split"] as const).map((l) => (
            <button
              key={l}
              onClick={() => apply(items, l)}
              className={`px-4 py-2 rounded border text-sm ${
                layout === l
                  ? "bg-purple-600 text-white"
                  : "bg-white"
              }`}
            >
              {l === "grid" ? "Grid" : "Split (Image + Text)"}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        {items.map((f, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border bg-neutral-50 space-y-3"
          >
            <input
              value={f.title}
              onChange={(e) =>
                updateItem(i, { title: e.target.value })
              }
              className="w-full p-3 rounded border bg-white text-lg font-semibold"
              placeholder="Feature title"
            />

            <textarea
              value={f.description ?? ""}
              onChange={(e) =>
                updateItem(i, { description: e.target.value })
              }
              className="w-full p-3 rounded border bg-white text-neutral-700"
              rows={3}
              placeholder="Explain the benefit clearly"
            />

            <ImageUploader
              currentUrl={f.image}
              onChange={(url: string) =>
                updateItem(i, { image: url })
              }
            />

            <div className="text-right">
              <button
                onClick={() => removeItem(i)}
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addFeature}
        className="px-4 py-2 rounded-lg bg-purple-600 text-white"
      >
        + Add Feature
      </button>
    </div>
  );
}
