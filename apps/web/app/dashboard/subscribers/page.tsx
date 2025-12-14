"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SubscribersPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.userId;

  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get creatorId
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/creators/by-user/${userId}`
      );
      const json = await res.json();
      if (json.ok && json.creator) setCreatorId(json.creator.id);
    })();
  }, [userId]);

  // Get subscribers
  useEffect(() => {
    if (!creatorId) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/by-creator/${creatorId}`
        );

        if (!res.ok) {
          console.error("Bad response", res.status);
          setSubs([]);
          return;
        }

        const json = await res.json();
        setSubs(json || []);
      } catch (err) {
        console.error("Subscriber fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [creatorId]);

  return (
    <div>
      <h1 className="dashboard-title">Subscribers</h1>

      {loading ? (
        <div className="no-data">Loading subscribers…</div>
      ) : subs.length === 0 ? (
        <div className="no-data">No subscribers found.</div>
      ) : (
        <div className="table">
          <div className="table-header">
            <span>User</span>
            <span>Product</span>
            <span>Status</span>
            <span>Next Billing</span>
          </div>

          {subs.map((s: any) => (
            <div className="table-row" key={s.id}>
              <span>{s.user?.email}</span>
              <span>{s.product?.name}</span>
              <span className="badge">{s.status}</span>
              <span>
                {s.currentPeriodEnd
                  ? new Date(s.currentPeriodEnd).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
