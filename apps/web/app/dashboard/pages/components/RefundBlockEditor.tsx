"use client";
import React, { useState } from "react";

export default function RefundBlockEditor({ block, onChange }: { block: any; onChange: (d: any) => void; }) {
  const data = block.data || {};
  const [text, setText] = useState(data.text || "14-day refund policy");

  function apply(v: string) { setText(v); onChange({ ...data, text: v }); }

  return (
    <div className="cm-editor-block space-y-3">
      <label className="block text-sm font-medium text-neutral-700">Refund Policy</label>
      <textarea value={text} onChange={(e) => apply(e.target.value)} className="w-full p-3 rounded-lg border border-neutral-200 bg-white text-neutral-900 min-h-[80px]" />
    </div>
  );
}
