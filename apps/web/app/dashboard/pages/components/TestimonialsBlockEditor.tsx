"use client";
import React, { useEffect, useState } from "react";
import ImageUploader from "../../../../components/ImageUploader";

type Testimonial = {
  name: string;
  text: string;
  rating: number;
  avatar?: string;
  theme?: string;
};

export default function TestimonialsBlockEditor({
  block,
  onChange,
}: {
  block: any;
  onChange: (d: any) => void;
}) {
  const data = block.data || {};
  const [items, setItems] = useState<Testimonial[]>(data.items || []);

  // 🔒 sync from block only when it actually changes
  useEffect(() => {
    if (Array.isArray(block.data?.items)) {
      setItems(block.data.items);
    }
  }, [block.data?.items]);

  function apply(next: Testimonial[]) {
    setItems(next);
    onChange({ ...data, items: next });
  }

  function updateItem(i: number, patch: Partial<Testimonial>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    apply(next);
  }

  function add() {
    apply([
      ...items,
      {
        name: "Customer name",
        text: "This product is incredible.",
        rating: 5,
        avatar: undefined,
        theme: "#ef4444",
      },
    ]);
  }

  function remove(i: number) {
    apply(items.filter((_, idx) => idx !== i));
  }

  return (
    <div className="cm-editor-block space-y-4">
      <label className="text-sm font-medium text-neutral-800">
        Testimonials
      </label>

      <div className="space-y-4">
        {items.map((t, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-neutral-300 bg-white space-y-4"
          >
            {/* Avatar uploader */}
            <ImageUploader
              label="Avatar"
              currentUrl={t.avatar}
              onChange={(url: string) =>
                updateItem(i, { avatar: url })
              }
            />

            {/* Name */}
            <input
              value={t.name}
              onChange={(e) =>
                updateItem(i, { name: e.target.value })
              }
              className="w-full text-sm font-semibold border rounded px-3 py-2"
              placeholder="Name"
            />

            {/* Quote */}
            <textarea
              value={t.text}
              onChange={(e) =>
                updateItem(i, { text: e.target.value })
              }
              rows={3}
              className="w-full p-3 rounded border text-sm"
              placeholder="Testimonial text"
            />

            {/* Rating */}
            <div className="flex items-center gap-3">
              <span className="text-sm">Rating</span>
              <select
                value={t.rating}
                onChange={(e) =>
                  updateItem(i, {
                    rating: Number(e.target.value),
                  })
                }
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} ⭐
                  </option>
                ))}
              </select>
            </div>

            {/* Theme */}
            <div className="flex items-center gap-3">
              <span className="text-sm">Card Color</span>
              <input
                type="color"
                value={t.theme ?? "#ef4444"}
                onChange={(e) =>
                  updateItem(i, { theme: e.target.value })
                }
              />
            </div>

            <div className="text-right">
              <button
                onClick={() => remove(i)}
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="px-4 py-2 rounded-lg bg-purple-600 text-white"
      >
        + Add Testimonial
      </button>
    </div>
  );
}
