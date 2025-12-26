"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type FunnelData = {
  pageViews: number;
  checkoutStarts: number;
  paymentsSuccess: number;
  viewToCheckoutRate: number;
  checkoutToPaymentRate: number;
  overallConversionRate: number;
};

export default function FunnelChart({ days = 30 }: { days?: number }) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadFunnel() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/funnel?days=${days}`,
          {
            headers: {
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
          }
        );

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error("Failed to load funnel data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFunnel();
  }, [status, session, days]);

  if (loading || !data) {
    return (
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-gray-400">
        Loading funnel…
      </div>
    );
  }

  const steps = [
    {
      label: "Page Views",
      value: data.pageViews,
      rate: "100%",
      color: "bg-blue-500/20 border-blue-400/30",
    },
    {
      label: "Checkout Started",
      value: data.checkoutStarts,
      rate: `${data.viewToCheckoutRate}%`,
      color: "bg-purple-500/20 border-purple-400/30",
    },
    {
      label: "Payments",
      value: data.paymentsSuccess,
      rate: `${data.checkoutToPaymentRate}%`,
      color: "bg-green-500/20 border-green-400/30",
    },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Conversion Funnel
        </h3>
        <span className="text-sm text-gray-400">
          Overall: {data.overallConversionRate}%
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className={`relative rounded-lg border ${step.color} p-4 hover:border-white/30 transition`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Step {idx + 1}
                </p>
                <p className="text-base font-medium text-white">
                  {step.label}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold text-white">
                  {step.value}
                </p>
                <p className="text-sm text-gray-400">
                  {step.rate}
                </p>
              </div>
            </div>

            {/* Connector */}
            {idx < steps.length - 1 && (
              <div className="absolute left-1/2 -bottom-4 h-4 w-px bg-white/20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
