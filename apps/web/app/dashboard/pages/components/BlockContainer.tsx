// apps/web/app/dashboard/pages/components/BlockContainer.tsx
"use client";

import React, { ReactNode, useState } from "react";

export default function BlockContainer({
  title,
  subtitle,
  id,
  index,
  onMoveUp,
  onMoveDown,
  onDelete,
  children,
}: {
  title: string;
  subtitle?: string;
  id?: string;
  index?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-4 rounded-2xl border border-neutral-700 bg-neutral-900 shadow transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <button
              aria-label="toggle"
              onClick={() => setOpen((v) => !v)}
              className="px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white"
            >
              {open ? "▾" : "▸"}
            </button>

            <div>
              <div className="font-semibold text-white text-[15px]">
                {title}
              </div>
              {subtitle && (
                <div className="text-xs text-neutral-400">{subtitle}</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 text-sm opacity-80">
          <button
            onClick={onMoveUp}
            className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 rounded-md border border-red-600 bg-red-900/40 hover:bg-red-800 text-red-400"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>

      {open && <div className="mt-4 bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">{children}</div>}
    </div>
  );
}
