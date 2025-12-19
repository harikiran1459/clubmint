"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SubscribersPage() {
  const { data: session, status } = useSession();
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/creator/subscribers`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setSubs(d.subscribers || []));
  }, [status]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscribers</h1>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-t border-white/10">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{s.product}</td>
                <td className="px-4 py-3">₹{s.amount}</td>
                <td className="px-4 py-3 capitalize">{s.status}</td>
                <td className="px-4 py-3 text-white/60">
                  {new Date(s.joinedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
