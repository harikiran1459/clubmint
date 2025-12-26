"use client";

type Page = {
  id: string;
  title: string;
  slug: string;
};

export default function PageSelector({
  pages,
  value,
  onChange,
}: {
  pages: Page[];
  value: string | null;
  onChange: (pageId: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-400">
        Sales Page
      </label>

      <select
        className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option className="text-black bg-white" value="" disabled>
          Select a page
        </option>

        {pages.map((p) => (
          <option className="text-black bg-white" key={p.id} value={p.id}>
            {p.title || p.slug}
          </option>
        ))}
      </select>
    </div>
  );
}
