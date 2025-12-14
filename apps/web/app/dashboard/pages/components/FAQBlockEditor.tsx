"use client";
import React, { useState } from "react";

type FAQ = { q: string; a: string };

export default function FAQBlockEditor({ block, onChange }: { block: any; onChange: (d: any) => void; }) {
  const data = block.data || {};
  const [items, setItems] = useState<FAQ[]>(data.items || []);

  function apply(next: FAQ[]) { setItems(next); onChange({ ...data, items: next }); }
  function add() { apply([...items, { q: "Question?", a: "Answer..." }]); }
  function edit(i: number, field: keyof FAQ, value: string) { const next = [...items]; next[i][field] = value; apply(next); }
  function remove(i: number) { apply(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="cm-editor-block space-y-4">
      <label className="text-sm font-medium text-neutral-700">FAQ</label>
      <div className="space-y-3">
        {items.map((qa, i) => (
          <div key={i} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <input value={qa.q} onChange={(e) => edit(i, "q", e.target.value)} className="w-full p-2 rounded border border-neutral-200 mb-2 bg-white text-neutral-900" placeholder="Question" />
            <textarea value={qa.a} onChange={(e) => edit(i, "a", e.target.value)} rows={2} className="w-full p-2 rounded border border-neutral-200 bg-white text-neutral-900" placeholder="Answer" />
            <div className="mt-2 text-right">
              <button onClick={() => remove(i)} className="px-3 py-1 text-sm rounded bg-red-50 text-red-600">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} className="px-4 py-2 rounded-lg bg-purple-600 text-white">+ Add FAQ</button>
    </div>
  );
}
