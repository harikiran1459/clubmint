"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProductAccessPage() {
  const router = useRouter();
  const { productId } = useParams() as { productId: string };
  const { data: session } = useSession();

  const [product, setProduct] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const initialGroupIds = product?.telegramGroups?.map((g: any) => g.id) ?? [];
  const hasChanges = selectedGroups.sort().join(",") !== initialGroupIds.sort().join(",");


  // Load product + existing access mapping
  useEffect(() => {
  if (!productId || !session?.accessToken) return;

  (async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    const json = await res.json();

    if (!json.ok || !json.product) {
      console.error("Failed to load product access", json);
      return;
    }

    setProduct(json.product);
    setSelectedGroups(
      json.product.telegramGroups?.map((g: any) => g.id) ?? []
    );
  })();
}, [productId, productId, session?.accessToken]);


  // Load creator telegram groups
  useEffect(() => {
    if (!product || !session?.accessToken) return;

    (async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/available-groups`, {
  headers: { Authorization: `Bearer ${session.accessToken}` },
});

      const json = await res.json();
      if (json.ok) setGroups(json.groups);
    })();
  }, [product, session?.accessToken]);

  function toggleGroup(id: string) {
    setSelectedGroups((prev) =>
      prev.includes(id)
        ? prev.filter((g) => g !== id)
        : [...prev, id]
    );
  }

  async function saveMapping() {
    setSaving(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            groupIds: selectedGroups,
          }),
        }
      );

      router.back();
    } finally {
      setSaving(false);
    }
  }

  if (!product) return <div className="no-data">Loading…</div>;

  return (
    <div>
      <h1 className="dashboard-title">Product Access</h1>

      <p className="muted" style={{ marginBottom: 20 }}>
        Select which Telegram groups are unlocked when someone buys{" "}
        <b>{product.title}</b>.
      </p>

      <div className="space-y-3">
        {groups.map((g) => (
          <label
            key={g.id}
            className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedGroups.includes(g.id)}
              onChange={() => toggleGroup(g.id)}
            />
            <div>
              <p className="font-semibold">
                {g.title || "Unnamed Group"}
              </p>
              <p className="text-sm text-gray-500">
                {g.username ? `@${g.username}` : g.tgGroupId}
              </p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={saveMapping}
        disabled={saving || !hasChanges}
        className="auth-btn"
        style={{ marginTop: 24 }}
      >

        {saving ? "Saving…" : "Save Access Mapping"}
      </button>
    </div>
  );
}
