"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";


type Payout = {
  id: string;
  totalAmount: number;
  paidAt: string | null;
  status: string;
};

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [lastPayout, setLastPayout] = useState<Payout | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    
    if (status === "loading") return;
    if (status !== "authenticated") {
      setLoading(false);
      return};
    
    const token = (session?.user as any)?.accessToken;
    if (!token) {
      setLoading(false);
      return};
    setLoading(true);
    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/earnings`,
        { credentials: "include", 
          headers: {
        Authorization: `Bearer ${token}`,
      },
     },
      );
      const json = await res.json();
      try{

      if (json.ok) {
        setBalance(json.balance);
        setLastPayout(json.lastPayout);
        setPayouts(json.payouts);
      }
      } finally {
      setLoading(false);
      }
    })();
  }, [status, session]);
  if (status === "loading") {
    return <div className="p-6">Authenticating…</div>;
  }

  if (loading) {
    return <div className="p-6">Loading earnings…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Available balance */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm opacity-70">Available balance</div>
        <div className="mt-2 text-3xl font-bold">
          ₹{(balance / 100).toFixed(2)}
        </div>
        <div className="mt-2 text-xs opacity-60">
          Payouts are processed weekly
        </div>
      </div>

      {/* Last payout */}
      {lastPayout && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm opacity-70">Last payout</div>
          <div className="mt-2 text-xl font-semibold">
            ₹{(lastPayout.totalAmount / 100).toFixed(2)}
          </div>
          <div className="text-xs opacity-60">
            {lastPayout.paidAt
              ? new Date(lastPayout.paidAt).toDateString()
              : ""}
          </div>
        </div>
      )}

      {/* Payout history */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 text-sm font-semibold">
          Payout history
        </div>

        {payouts.length === 0 ? (
          <div className="text-sm opacity-60">
            No payouts yet.
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {p.paidAt
                    ? new Date(p.paidAt).toDateString()
                    : "Processing"}
                </span>
                <span>
                  ₹{(p.totalAmount / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
