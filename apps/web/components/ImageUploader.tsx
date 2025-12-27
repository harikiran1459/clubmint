// apps/web/components/ImageUploader.tsx

"use client";

import { useEffect, useState } from "react";

type Props = {
  label?: string;
  currentUrl?: string;
  onChange: (url: string) => void;
};

/**
 * PROD-SAFE ImageUploader
 * - Works with Cloudflare R2 / S3
 * - Persists preview after refresh
 * - Handles absolute + relative URLs
 */
export default function ImageUploader({
  label,
  currentUrl,
  onChange,
}: Props) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [uploading, setUploading] = useState(false);

  // 🔁 Keep preview in sync with parent state (VERY IMPORTANT)
  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  async function upload(file: File) {
    try {
      setUploading(true);

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

      if (!json.ok || !json.url) {
        throw new Error("Upload failed");
      }

      // Normalize URL (absolute)
      const finalUrl = json.url.startsWith("http")
        ? json.url
        : `${process.env.NEXT_PUBLIC_API_URL}${json.url}`;

      setPreview(finalUrl);
      onChange(finalUrl);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-sm font-medium text-neutral-600">
          {label}
        </div>
      )}

      {/* Preview */}
      {preview ? (
        <div className="relative w-24 h-24">
          <img
            src={preview}
            alt="Uploaded"
            className="w-24 h-24 rounded-full object-cover border"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(undefined);
              onChange("");
            }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="w-24 h-24 rounded-full border border-dashed flex items-center justify-center text-xs text-neutral-400">
          No image
        </div>
      )}

      {/* File input */}
      <label className="inline-block">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
        <span className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-300 hover:bg-neutral-200 text-sm">
          {uploading ? "Uploading…" : "Upload image"}
        </span>
      </label>
    </div>
  );
}
