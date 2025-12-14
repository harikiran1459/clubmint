"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProductGroupMappingPage() {
  const router = useRouter();
  const params = useParams() as { productId: string };
  const productId = params.productId;

  const [product, setProduct] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Load product + existing mapping
  useEffect(() => {
    if (!productId) return;

    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/telegram/creator/${productId}/group-mapping`
      );
      const json = await res.json();
      if (json.ok) {
        const prod = json.products.find((p: any) => p.id === productId);
        setProduct(prod);
        setSelectedGroups(prod.telegramGroups.map((g: any) => g.id));
      }
    })();
  }, [productId]);

  // Load creator's groups
  useEffect(() => {
    if (!product) return;

    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/telegram/groups/${product.creatorId}`
      );
      const json = await res.json();
      if (json.ok) setGroups(json.groups);
    })();
  }, [product]);

  async function saveMapping() {
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/telegram/map-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          groupIds: selectedGroups,
        }),
      });

      alert("Mapping saved!");
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function toggleGroup(id: string) {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  if (!product) return <div>Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="dashboard-title">Telegram Group Mapping</h1>
      <p className="muted mb-4">
        Choose which groups <b>{product.title}</b> unlocks.
      </p>

      <div className="space-y-3">
        {groups.map((g) => (
          <label
            key={g.id}
            className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedGroups.includes(g.id)}
              onChange={() => toggleGroup(g.id)}
            />
            <div>
              <p className="font-semibold">{g.title || "Unnamed Group"}</p>
              <p className="text-sm text-gray-500">{g.tgGroupId}</p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={saveMapping}
        disabled={saving}
        className="auth-btn mt-6"
      >
        {saving ? "Saving…" : "Save Mapping"}
      </button>
    </div>
  );
}