"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PayoutsPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState({ totalRevenue: 0,
  totalCommission: 0,
  netEarnings: 0,});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<any[]>([]);


  useEffect(() => {
    if (status !== "authenticated") return;

    const token = (session?.user as any)?.accessToken;
    if (!token) {
      setLoading(false);
      return};

    async function load() {
      const [earningsRes, txRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/creator/earnings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/payouts/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/payouts/history`, {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json())
  .then((json) => {
    if (json.ok) setPayouts(json.payouts);
  }),
      ]);

      const earningsJson = await earningsRes.json();
      const txJson = await txRes.json();

      if (earningsJson.ok) setData(earningsJson);
      if (txJson.ok) setTransactions(txJson.payments);
      

      setLoading(false);
    }

    load();
  }, [status, session]);

  if (status === "loading" || loading) {
    return <div className="p-10 text-white/60">Loading payouts…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      {/* Manual payout notice */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-2">
          Payouts during beta
        </h2>
        <p className="text-white/70">
          During beta, payouts are processed manually on a weekly basis.
          Please ensure your payout details are added in Settings.
        </p>
      </div>

      {/* Earnings summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Revenue" value={`₹${data.totalRevenue ?? 0 / 100}`} />
        <Card title="Platform Fee" value={`₹${data.totalCommission ?? 0 / 100}`} />
        <Card title="You Earned" value={`₹${data.netEarnings ?? 0 / 100}`} />
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Transaction history
        </h2>

        {transactions.length === 0 ? (
          <p className="text-white/60">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Subscriber</th>
                  <th className="p-3 text-right">Gross</th>
                  <th className="p-3 text-right">Commission</th>
                  <th className="p-3 text-right">You earn</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-white/10">
                    <td className="p-3">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">{t.product}</td>
                    <td className="p-3">{t.subscriber}</td>
                    <td className="p-3 text-right">₹{t.gross / 100}</td>
                    <td className="p-3 text-right text-red-400">
                      -₹{t.commission / 100}
                    </td>
                    <td className="p-3 text-right text-green-400">
                      ₹{t.net / 100}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                        paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

        {/* Payout history */}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Payout history
        </h2>

        {payouts.length === 0 ? (
          <p className="text-white/60">No payouts yet.</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="flex justify-between rounded-lg border border-white/10 bg-white/5 p-4 text-sm"
              >
                <div>
                  <div>
                    {new Date(p.periodStart).toLocaleDateString()} →{" "}
                    {new Date(p.periodEnd).toLocaleDateString()}
                  </div>
                  <div className="text-xs opacity-60">
                    {p.paidAt
                      ? `Paid on ${new Date(p.paidAt).toDateString()}`
                      : "Processing"}
                  </div>
                </div>

                <div className="font-semibold">
                  ₹{(p.totalAmount / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-white/60">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
