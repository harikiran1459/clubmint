"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function PricingBlockEditor({
  block,
  onChange,
}: {
  block: any;
  onChange: (d: any) => void;
}) {
  const { data: session } = useSession();

  const data = block.data || {};
  const [products, setProducts] = useState<any[]>([]);
  const [productIds, setProductIds] = useState<string[]>(
    data.productIds || []
  );

  // ------------------------------------------------
  // Sync local state when block changes (IMPORTANT)
  // ------------------------------------------------
  useEffect(() => {
    setProductIds(block.data?.productIds || []);
  }, [block.data?.productIds]);

  // ------------------------------------------------
  // Load creator products
  // ------------------------------------------------
  useEffect(() => {
    if (!session?.accessToken) return;

    async function loadProducts() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/products`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );

        setProducts(res.data.products ?? []);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    }

    loadProducts();
  }, [session]);

  // ------------------------------------------------
  // Toggle product selection (MULTI)
  // ------------------------------------------------
  function toggleProduct(productId: string) {
    let next: string[];

    if (productIds.includes(productId)) {
      next = productIds.filter((id) => id !== productId);
    } else {
      next = [...productIds, productId];
    }

    setProductIds(next);
    onChange({ ...data, productIds: next });
  }

  // ------------------------------------------------
  // UI
  // ------------------------------------------------
  return (
    <div className="cm-editor-block space-y-4">
      <label className="text-sm font-medium text-neutral-700">
        Pricing (Products)
      </label>

      {products.length === 0 ? (
        <div className="text-sm text-neutral-500">
          No products yet. Create products first.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => {
            const selected = productIds.includes(p.id);

            return (
              <div
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition
                  ${
                    selected
                      ? "border-purple-500 bg-purple-50"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-neutral-800">
                      {p.title}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {(p.priceCents / 100).toFixed(2)}{" "}
                      {p.currency?.toUpperCase()}
                      {p.billingInterval
                        ? ` / ${p.billingInterval}`
                        : ""}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    className="h-4 w-4 accent-purple-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
