"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import MetricCard from "../components/dashboard/MetricCard";
import RevenueChart from "../components/dashboard/RevenueChart";


export default function DashboardHome() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
   const revenueTrend = [
  { label: "Week 1", value: 12000 },
  { label: "Week 2", value: 18000 },
  { label: "Week 3", value: 26000 },
  { label: "Week 4", value: 32000 },
];


  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadStats() {
      try{
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stats/creator/overview`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );

      const json = await res.json();
      if (json.ok){
      setStats(json.data);
     console.log("STATS RESPONSE:", json);}
     else {
  setStats({
    revenue: {
      netThisMonth: 0,
      mrr: 0,
      commissionPaid: 0,
    },
    subscribers: {
      active: 0,
      newThisWeek: 0,
      churnedThisMonth: 0,
    },
    products: {},
    automation: { healthy: false },
  });
}
    
    } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [status, session]);

  if (loading) {
    return (
      <div className="p-10 text-gray-400">
        Loading your creator dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ---------------- Revenue ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Net Revenue (This Month)"
          value={`₹${stats.revenue.netThisMonth ?? 0}`}
          accent="purple"
        />
        <MetricCard
          title="MRR"
          value={`₹${stats.revenue.mrr ?? 0}`}
        />
        <MetricCard
          title="Commission Paid"
          value={`₹${stats.revenue.commissionPaid ?? 0}`}
          subtle
        />
      </div>

      {/* ---------------- Subscribers ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Active Subscribers"
          value={stats.subscribers.active}
        />
        <MetricCard
          title="New This Week"
          value={stats.subscribers.newThisWeek}
          positive
        />
        <MetricCard
          title="Churned This Month"
          value={stats.subscribers.churnedThisMonth}
          negative
        />
      </div>

      {/* ---------------- Health ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Top Product"
          value={
            stats.products.topProduct
              ? `${stats.products.topProduct.name} — ₹${stats.products.topProduct.revenue}`
              : "No sales yet"
          }
        />

        <MetricCard
          title="Telegram Automation"
          value={
            stats.automation.telegramStatus === "ok"
              ? "All systems operational"
              : stats.automation.telegramStatus === "warning"
              ? `${stats.automation.pendingActions} pending actions`
              : "Not connected"
          }
          accent={
            stats.automation.telegramStatus === "ok"
              ? "green"
              : stats.automation.telegramStatus === "warning"
              ? "yellow"
              : "red"
          }
        />

        <MetricCard
          title="Automation Health"
          value={stats.automation.healthy ? "Healthy" : "Issues"}
          positive={stats.automation.healthy}
          negative={!stats.automation.healthy}
        />

        <RevenueChart data={revenueTrend} />

      </div>
    </div>
  );
}
