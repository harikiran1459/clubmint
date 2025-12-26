"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type PendingPayout = {
  creatorId: string;
  handle: string;
  totalPending: number;

  payoutMethod: "bank" | "upi" | null;

  bankName?: string | null;
  accountNumber?: string | null;
  ifsc?: string | null;
  accountHolder?: string | null;

  upiId?: string | null;
};

export default function AdminPayoutsPage() {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<PendingPayout[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const token = (session?.user as any)?.accessToken;
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/payouts/pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const json = await res.json();
        if (json.ok) setPayouts(json.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [status, session]);

  async function runPayout(creatorId: string) {
    const token = (session?.user as any)?.accessToken;
    if (!token) return;

    setRunning(creatorId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/payouts/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ creatorId }),
        }
      );

      const json = await res.json();

      if (json.ok) {
        setPayouts((prev) =>
          prev.filter((p) => p.creatorId !== creatorId)
        );
      }
    } finally {
      setRunning(null);
    }
  }

  if (status === "loading" || loading) {
    return <div className="p-6 text-white/60">Loading payouts…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Admin · Payouts</h1>
        <p className="text-sm text-white/60 mt-1">
          Review and manually process creator payouts during beta.
        </p>
      </header>

      {payouts.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
          No pending payouts 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {payouts.map((p) => {
            const hasValidDetails =
              (p.payoutMethod === "upi" && p.upiId) ||
              (p.payoutMethod === "bank" &&
                p.accountNumber &&
                p.ifsc &&
                p.accountHolder);

            return (
              <div
                key={p.creatorId}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-lg">
                      @{p.handle}
                    </div>
                    <div className="text-sm text-white/60">
                      Pending payout
                    </div>
                    <div className="text-xl font-semibold text-green-400 mt-1">
                      ₹{(p.totalPending / 100).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => runPayout(p.creatorId)}
                    disabled={
                      running === p.creatorId || !hasValidDetails
                    }
                    className={`rounded-xl px-5 py-2 text-sm font-medium transition
                      ${
                        hasValidDetails
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-gray-600 cursor-not-allowed"
                      }
                    `}
                  >
                    {running === p.creatorId
                      ? "Processing…"
                      : "Mark as Paid"}
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10" />

                {/* Payout details */}
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase opacity-50">
                      Method
                    </span>
                    <span className="text-xs rounded-full bg-white/10 px-2 py-0.5">
                      {p.payoutMethod ?? "Not set"}
                    </span>
                  </div>

                  {p.payoutMethod === "upi" && p.upiId && (
                    <div className="font-mono text-sm">
                      {p.upiId}
                    </div>
                  )}

                  {p.payoutMethod === "bank" && (
                    <div className="space-y-0.5 text-sm">
                      <div>{p.accountHolder}</div>
                      <div>
                        {p.bankName} ·{" "}
                        <span className="font-mono">
                          {p.accountNumber}
                        </span>
                      </div>
                      <div className="font-mono opacity-70">
                        {p.ifsc}
                      </div>
                    </div>
                  )}

                  {!hasValidDetails && (
                    <div className="text-xs text-red-400 mt-2">
                      ❌ Payout details missing — creator must update settings
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
