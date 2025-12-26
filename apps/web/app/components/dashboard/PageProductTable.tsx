"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type ProductFunnelRow = {
  productId: string;
  title: string;
  checkoutStarts: number;
  payments: number;
  conversionRate: number;
};

export default function PageProductTable({
  pageId,
  days = 30,
}: {
  pageId: string;
  days?: number;
}) {
  const { data: session, status } = useSession();
  const [rows, setRows] = useState<ProductFunnelRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pageId || status !== "authenticated") return;

    async function loadProductFunnel() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/page-product-funnel?pageId=${pageId}&days=${days}`,
          {
            headers: {
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
          }
        );

        const json = await res.json();
        setRows(json.data ?? []);
      } catch (err) {
        console.error("Page product funnel load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProductFunnel();
  }, [pageId, days, status, session]);

  if (!pageId) {
    return (
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-gray-400">
        Select a page to see product performance
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-gray-400">
        Loading product performance…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-gray-400">
        No product conversions yet for this page
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Product Conversion from this Page
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="text-left py-2">Product</th>
              <th className="text-right py-2">Checkout</th>
              <th className="text-right py-2">Payments</th>
              <th className="text-right py-2">Conversion</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr
                key={r.productId}
                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150"
              >
                <td className="py-3 text-white">
                  {r.title}
                </td>
                <td className="py-3 text-right text-gray-300">
                  {r.checkoutStarts}
                </td>
                <td className="py-3 text-right text-gray-300">
                  {r.payments}
                </td>
                <td className="py-3 text-right font-medium text-white">
                  {r.conversionRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
