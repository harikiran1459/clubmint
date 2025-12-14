"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function PaymentsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.userId;

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/by-user/${userId}`
        );

        const json = await res.json();
        setPayments(json || []);
      } catch (err) {
        console.error("Payment fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <div>
      <h1 className="dashboard-title">Payments</h1>

      {loading ? (
        <div className="no-data">Loading payments…</div>
      ) : payments.length === 0 ? (
        <div className="no-data">No payments recorded yet.</div>
      ) : (
        <div className="table">
          <div className="table-header">
            <span>Amount</span>
            <span>User</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {payments.map((p: any) => (
            <div className="table-row" key={p.id}>
              <span>${(p.amount / 100).toFixed(2)}</span>
              <span>{p.userEmail}</span>
              <span className="badge">{p.status}</span>
              <span>{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
