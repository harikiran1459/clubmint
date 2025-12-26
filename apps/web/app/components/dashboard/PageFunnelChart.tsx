"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type PageFunnelData = {
  pageViews: number;
  checkoutStarts: number;
  paymentsSuccess: number;
  viewToCheckoutRate: number;
  checkoutToPaymentRate: number;
  overallConversionRate: number;
};

export default function PageFunnelChart({
  pageId,
  days = 30,
}: {
  pageId: string;
  days?: number;
}) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<PageFunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pageId || status !== "authenticated") return;

    async function loadPageFunnel() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/page-funnel?pageId=${pageId}&days=${days}`,
          {
            headers: {
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
          }
        );

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error("Page funnel load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPageFunnel();
  }, [pageId, days, status, session]);

  if (!pageId) {
    return (
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-gray-400">
        Select a page to view its funnel
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-gray-400">
        Loading page funnel…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Page Conversion Funnel
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-500/10 border border-blue-400/20 p-4">
          <p className="text-sm text-gray-400">Page Views</p>
          <p className="text-xl font-semibold text-white">
            {data.pageViews}
          </p>
        </div>

        <div className="rounded-lg bg-purple-500/10 border border-purple-400/20 p-4">
          <p className="text-sm text-gray-400">Checkout</p>
          <p className="text-xl font-semibold text-white">
            {data.checkoutStarts}
          </p>
          <p className="text-xs text-gray-400">
            {data.viewToCheckoutRate}%
          </p>
        </div>

        <div className="rounded-lg bg-green-500/10 border border-green-400/20 p-4">
          <p className="text-sm text-gray-400">Payments</p>
          <p className="text-xl font-semibold text-white">
            {data.paymentsSuccess}
          </p>
          <p className="text-xs text-gray-400">
            {data.checkoutToPaymentRate}%
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Overall conversion:{" "}
        <span className="text-white font-medium">
          {data.overallConversionRate}%
        </span>
      </p>
    </div>
  );
}
