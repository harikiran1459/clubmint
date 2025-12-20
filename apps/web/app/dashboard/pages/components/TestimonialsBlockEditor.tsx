"use client";
import React, { useState } from "react";
import ImageUploader from "../../../../components/ImageUploader";

type Testimonial = {
  name: string;
  role?: string;
  company?: string;
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

  function apply(next: Testimonial[]) {
    setItems(next);
    onChange({ ...data, items: next });
  }

  function add() {
    apply([
      ...items,
      {
        name: "Name",
        role: "Role",
        company: "Company",
        text: "This product is incredible.",
        rating: 5,
        avatar: undefined,
        theme: "#ef4444",
      },
    ]);
  }

  function edit(
    i: number,
    field: keyof Testimonial,
    value: any
  ) {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    apply(next);
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
            className="p-4 rounded-xl border border-neutral-300 bg-white space-y-3"
          >
            {/* Header */}
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100">
                <ImageUploader
                  currentUrl={t.avatar}
                  onChange={(url) =>
                    edit(i, "avatar", url ?? undefined)
                  }
                />
              </div>

              <div className="flex-1">
                <input
                  value={t.name}
                  onChange={(e) =>
                    edit(i, "name", e.target.value)
                  }
                  className="w-full text-m font-semibold border rounded px-2 py-1"
                  placeholder="Name"
                />
                {/* <input
                  value={t.role}
                  onChange={(e) =>
                    edit(i, "role", e.target.value)
                  }
                  className="w-full text-xs border rounded px-2 py-1 mt-1"
                  placeholder="Role / Title"
                />
                <input
                  value={t.company || ""}
                  onChange={(e) => edit(i, "company", e.target.value)}
                  className="w-full p-2 rounded border border-neutral-200 bg-white text-neutral-900"
                  placeholder="Company (optional)"
                /> */}

              </div>
            </div>

            {/* Text */}
            <textarea
              value={t.text}
              onChange={(e) =>
                edit(i, "text", e.target.value)
              }
              rows={3}
              className="w-full p-2 rounded border"
              placeholder="Testimonial text"
            />

            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Rating</span>
              <select
                value={t.rating}
                onChange={(e) =>
                  edit(i, "rating", Number(e.target.value))
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

            {/* Theme color */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Card Color</span>
              <input
                type="color"
                value={t.theme ?? "#ef4444"}
                onChange={(e) =>
                  edit(i, "theme", e.target.value)
                }
              />
            </div>

            <div className="text-right">
              <button
                onClick={() => remove(i)}
                className="px-3 py-1 text-sm rounded bg-red-50 text-red-600"
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
