"use client";

import { useState } from "react";

type Props = {
  label?: string;
  currentUrl?: string;
  onChange: (url: string) => void;
};

export default function ImageUploader({ label, currentUrl, onChange }: Props) {
  const [preview, setPreview] = useState(currentUrl);

  async function upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const json = await res.json();

    if (json.ok) {
      setPreview(json.url);
      onChange(json.url); // ✅ now guaranteed
    }
  }

  return (
    <div>
      {label && <div className="muted">{label}</div>}

      {preview && (
        <img
          src={preview}
          className="w-24 h-24 rounded-full object-cover mb-3"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            upload(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}
