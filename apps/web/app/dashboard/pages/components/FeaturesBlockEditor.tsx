"use client";
import React, { useState } from "react";

export default function FeaturesBlockEditor({ block, onChange }: { block: any; onChange: (d: any) => void; }) {
  const data = block.data || {};
  const [items, setItems] = useState<string[]>(data.items || []);

  function apply(next: string[]) {
    setItems(next);
    onChange({ ...data, items: next });
  }

  return (
    <div className="cm-editor-block space-y-4">
      <label className="text-sm font-medium text-neutral-700">Features</label>
      <div className="space-y-2">
        {items.map((t, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={t} onChange={(e) => { const next = [...items]; next[i] = e.target.value; apply(next); }} className="flex-1 p-2 rounded-lg border border-neutral-200 bg-white text-neutral-900" />
            <button onClick={() => apply(items.filter((_, idx) => idx !== i))} className="px-3 py-2 text-sm rounded bg-red-50 text-red-600">Remove</button>
          </div>
        ))}
      </div>

      <button onClick={() => apply([...items, "New feature"])} className="px-4 py-2 rounded-lg bg-purple-600 text-white">+ Add Feature</button>
    </div>
  );
}
