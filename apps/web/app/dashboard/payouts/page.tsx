"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PayoutsPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [payoutStatus, setPayoutStatus] = useState<{connected: boolean;status: string;} | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
  if (!payoutStatus?.connected) return;

  async function loadTransactions() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payouts/transactions`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );

    const json = await res.json();
    if (json.ok) setTransactions(json.payments);
  }

  loadTransactions();
}, [payoutStatus]);

useEffect(() => {
  if (status !== "authenticated") return;

  async function loadPayoutStatus() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payouts/status`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );

    const json = await res.json();
    setPayoutStatus(json);
  }

  loadPayoutStatus();
}, [status]);

async function connectRazorpay() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/payouts/connect`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }
  );

  const json = await res.json();

  if (json.url) {
    window.location.href = json.url;
  } else {
    alert("Failed to start Razorpay onboarding");
  }
}


  useEffect(() => {
    if (!session?.accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/creator/earnings`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
      .then((r) => r.json())
      .then(setData);
  }, [session]);

  if (!payoutStatus) {
  return <div className="p-10 text-gray-400">Loading payouts…</div>;
}

if (payoutStatus.status === "pending") {
  return (
    <div className="max-w-xl mx-auto mt-16">
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Complete Razorpay onboarding
        </h2>

        <p className="text-white/70 mb-6">
          Your Razorpay account is created but not fully verified.
          Complete onboarding to enable payouts.
        </p>

        <button
          onClick={connectRazorpay}
          className="bg-yellow-500 px-6 py-3 rounded-xl font-medium text-black"
        >
          Continue onboarding
        </button>
      </div>
    </div>
  );
}


/* ------------------------------------------------
   NOT CONNECTED → SHOW CONNECT CARD ONLY
------------------------------------------------- */
if (!payoutStatus.connected) {
  return (
    <div className="max-w-xl mx-auto mt-16">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Connect Razorpay to receive payouts
        </h2>

        <p className="text-white/60 mb-6">
          Connect your Razorpay account to receive payments from subscribers.
          Your earnings will be transferred directly to your bank account.
        </p>

        <button
          onClick={connectRazorpay}
          className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-medium"
        >
          Connect Razorpay
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Payouts</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Revenue" value={`₹${data.totalRevenue / 100}`} />
        <Card title="Platform Fee" value={`₹${data.totalCommission / 100}`} />
        <Card title="You Earned" value={`₹${data.netEarnings / 100}`} />
      </div>
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Transaction history</h2>

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
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          t.status === "paid"
                            ? "bg-green-500/20 text-green-400"
                            : t.status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-white/50">
        Payouts are settled directly to your connected Razorpay account.
      </p>
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
