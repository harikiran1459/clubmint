"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SubscribersPage() {
  const { data: session, status } = useSession();
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribers`, {
      headers: {
        Authorization: `Bearer ${(session?.user as any)?.accessToken}`,
      },
    })
      .then((r) => r.json())
      .then((j) => j.ok && setSubs(j.subscribers));
  }, [status, session]);

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Subscribers</h1>

      {subs.length === 0 ? (
        <div className="text-white/60">
          No subscribers yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3 text-left">Subscriber</th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Platform</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Granted</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.productTitle}</td>
                  <td className="p-3">{s.platform}</td>
                  <td className="p-3">{s.status}</td>
                  <td className="p-3">
                    {new Date(s.grantedAt).toDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
