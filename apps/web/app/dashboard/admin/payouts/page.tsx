"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type PendingPayout = {
  creatorId: string;
  handle: string;
  totalPending: number;

  payoutMethod: "bank" | "upi" | null;

  // Bank details
  bankName?: string | null;
  accountNumber?: string | null;
  ifsc?: string | null;
  accountHolder?: string | null;

  // UPI
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
    if (!token) {
      setLoading(false);
      return};

    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/payouts/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (json.ok) {
        setPayouts(json.data);
      }

      setLoading(false);
    })();
  }, [status, session]);

  async function runPayout(creatorId: string) {
    const token = (session?.user as any)?.accessToken;
    if (!token) return;

    setRunning(creatorId);

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

    setRunning(null);
  }

  if (status === "loading" || loading) {
    return <div className="p-6">Loading payouts…</div>;
  }

  return (
  <div className="space-y-6">
    <h1 className="text-xl font-semibold">Admin Payouts</h1>

    {payouts.length === 0 ? (
      <div className="text-sm opacity-60">
        No pending payouts.
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
              className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    @{p.handle}
                  </div>
                  <div className="text-sm opacity-70">
                    ₹{(p.totalPending / 100).toFixed(2)} pending
                  </div>
                </div>

                <button
                  onClick={() => runPayout(p.creatorId)}
                  disabled={
                    running === p.creatorId || !hasValidDetails
                  }
                  className={`rounded-lg px-4 py-2 text-sm transition
                    ${
                      hasValidDetails
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-600 cursor-not-allowed"
                    }
                  `}
                >
                  {running === p.creatorId
                    ? "Processing…"
                    : "Mark Paid"}
                </button>
              </div>

              {/* Payout details */}
              <div className="text-xs opacity-80">
                {p.payoutMethod === "upi" && p.upiId && (
                  <>
                    <span className="opacity-60">UPI:</span>{" "}
                    <span className="font-mono">{p.upiId}</span>
                  </>
                )}

                {p.payoutMethod === "bank" && (
                  <>
                    <div>{p.accountHolder}</div>
                    <div>
                      {p.bankName} ·{" "}
                      <span className="font-mono">
                        {p.accountNumber}
                      </span>
                    </div>
                    <div className="font-mono">{p.ifsc}</div>
                  </>
                )}

                {!hasValidDetails && (
                  <div className="text-red-400">
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
