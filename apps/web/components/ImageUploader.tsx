"use client";

import { useState } from "react";

export default function ImageUploader({ value, onChange }: any) {
  const [preview, setPreview] = useState(value || null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setUploading(false);

    if (json.ok) {
      setPreview(json.url);
      onChange(json.url);
    }
  }

  return (
    <div className="w-full">
      {preview ? (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${preview}`}
          className="rounded-lg w-full object-cover mb-2"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 mb-2">
          No Image
        </div>
      )}

      <label className="cursor-pointer px-4 py-2 rounded bg-purple-600 text-white inline-block">
        {uploading ? "Uploading..." : "Upload Image"}
        <input type="file" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}
