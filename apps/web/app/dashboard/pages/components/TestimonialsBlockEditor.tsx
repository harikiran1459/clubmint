  "use client";
  import React, { useState } from "react";

  type Testimonial = { name: string; text: string };

  export default function TestimonialsBlockEditor({ block, onChange }: { block: any; onChange: (d: any) => void; }) {
    const data = block.data || {};
    const [items, setItems] = useState<Testimonial[]>(data.items || []);

    function apply(next: Testimonial[]) { setItems(next); onChange({ ...data, items: next }); }
    function add() { apply([...items, { name: "Name", text: "Testimonial..." }]); }
    function edit(i: number, field: keyof Testimonial, value: string) { const next = [...items]; next[i] = { ...next[i], [field]: value }; apply(next); }
    function remove(i: number) { apply(items.filter((_, idx) => idx !== i)); }

    return (
      <div className="cm-editor-block space-y-4">
        <label className="text-sm font-medium text-neutral-700">Testimonials</label>
        <div className="space-y-3">
          {items.map((t, i) => (
            <div key={i} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <input value={t.name} onChange={(e) => edit(i, "name", e.target.value)} className="w-full p-2 rounded border border-neutral-200 mb-2 bg-white text-neutral-900" placeholder="Name" />
              <textarea value={t.text} onChange={(e) => edit(i, "text", e.target.value)} rows={3} className="w-full p-2 rounded border border-neutral-200 bg-white text-neutral-900" placeholder="Testimonial" />
              <div className="mt-2 text-right">
                <button onClick={() => remove(i)} className="px-3 py-1 text-sm rounded bg-red-50 text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={add} className="px-4 py-2 rounded-lg bg-purple-600 text-white">+ Add Testimonial</button>
      </div>
    );
  }
