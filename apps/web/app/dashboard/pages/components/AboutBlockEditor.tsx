"use client";
import React, { useEffect, useState } from "react";
import ImageUploader from "../../../../components/ImageUploader";

export default function AboutBlockEditor({ block, onChange }: any) {
  const data = block.data || {};

  const [headline, setHeadline] = useState(data.headline ?? "About Us");
  const [text, setText] = useState(data.text ?? "");
  const [mediaType, setMediaType] = useState<"image" | "video">(
    data.mediaType ?? "image"
  );
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(
    data.mediaUrl
  );

  useEffect(() => {
    onChange({
      ...data,
      headline,
      text,
      mediaType,
      mediaUrl,
    });
  }, [headline, text, mediaType, mediaUrl]);

  return (
    <div className="cm-editor-block space-y-4">
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        className="w-full p-3 rounded border bg-white text-lg font-semibold"
        placeholder="About Us"
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full p-3 rounded border bg-white text-neutral-700"
        placeholder="Tell your story. Build trust."
      />

      <div className="flex gap-2">
        {["image", "video"].map((t) => (
          <button
            key={t}
            onClick={() => setMediaType(t as any)}
            className={`px-3 py-2 rounded border ${
              mediaType === t
                ? "bg-purple-600 text-white"
                : "bg-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {mediaType === "image" ? (
        <ImageUploader
          currentUrl={mediaUrl}
          onChange={(url: string) => setMediaUrl(url)}
        />
      ) : (
        <input
          value={mediaUrl ?? ""}
          onChange={(e) => setMediaUrl(e.target.value)}
          className="w-full p-3 rounded border bg-white"
          placeholder="YouTube URL or upload a video/image"
        />
      )}
    </div>
  );
}
