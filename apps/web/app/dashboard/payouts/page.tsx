"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const MIN_PAYOUT = 100; // ₹100

export default function PayoutsPage() {
  const { data: session, status } = useSession();

  const [earnings, setEarnings] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    netEarnings: 0,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    const token = (session?.user as any)?.accessToken;
    if (!token) return;

    async function load() {
      try {
        const [earningsRes, txRes, payoutsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/creator/earnings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payouts/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/payouts/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const e = await earningsRes.json();
        const t = await txRes.json();
        const p = await payoutsRes.json();

        if (e.ok) setEarnings(e);
        if (t.ok) setTransactions(t.payments);
        if (p.ok) setPayouts(p.payouts);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, session]);

  if (loading || status === "loading") {
    return <div className="p-10 text-white/60">Loading payouts…</div>;
  }

  const available = earnings.netEarnings / 100;
  const paidOut = payouts.reduce((s, p) => s + p.totalAmount, 0) / 100;
  const payoutEligible = available >= MIN_PAYOUT;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10">
      {/* Info banner */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-1">Payouts (Beta)</h2>
        <p className="text-white/70 text-sm">
          Payouts are processed manually once a week during beta.
          Minimum payout amount is ₹{MIN_PAYOUT}.
        </p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Available for payout"
          value={`₹${available.toFixed(2)}`}
          accent={payoutEligible ? "green" : "yellow"}
          subtitle={
            payoutEligible
              ? "Eligible for next payout"
              : `Minimum ₹${MIN_PAYOUT} required`
          }
        />
        <StatCard
          title="Paid out"
          value={`₹${paidOut.toFixed(2)}`}
          accent="purple"
        />
        <StatCard
          title="Lifetime revenue"
          value={`₹${(earnings.totalRevenue / 100).toFixed(2)}`}
        />
      </div>

      {/* Transactions */}
      <Section title="Transaction history">
        {transactions.length === 0 ? (
          <Empty label="No transactions yet." />
        ) : (
          <Table transactions={transactions} />
        )}
      </Section>

      {/* Payout history */}
      <Section title="Payout history">
        {payouts.length === 0 ? (
          <Empty label="No payouts yet." />
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
                    Paid on {new Date(p.paidAt).toDateString()}
                  </div>
                </div>
                <div className="font-semibold">
                  ₹{(p.totalAmount / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ---------- Small UI pieces ---------- */

function StatCard({
  title,
  value,
  subtitle,
  accent = "purple",
}: any) {
  const accentMap: any = {
    purple: "text-purple-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-white/60">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${accentMap[accent]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-white/50 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="text-white/60 text-sm">{label}</p>;
}

function Table({ transactions }: any) {
  return (
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
          {transactions.map((t: any) => (
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
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
