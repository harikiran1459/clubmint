"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import MetricCard from "../components/dashboard/MetricCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import FunnelChart from "../components/dashboard/FunnelChart";
import PageSelector from "../components/dashboard/PageSelector";
import PageFunnelChart from "../components/dashboard/PageFunnelChart";
import PageProductTable from "../components/dashboard/PageProductTable";
import SkeletonCard from "../components/dashboard/SkeletonCard";
import SectionHeader from "../components/dashboard/SectionHeader";



type OverviewStats = {
  pageViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  revenue: number;
};

export default function DashboardHome() {
  const { data: session, status } = useSession();

  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<any[]>([]);
const [selectedPageId, setSelectedPageId] = useState<string | null>(null);


  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadAnalytics() {
      try {
        const headers = {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        };

        // ---------------- Overview cards ----------------
        const overviewRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/overview`,
          { headers }
        );
        // ---------------- Creator pages ----------------
const pagesRes = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/pages`,
  { headers }
);
const pagesJson = await pagesRes.json();
setPages(pagesJson.pages ?? []);

        const overviewJson = await overviewRes.json();
        setOverview(overviewJson.data);

        // ---------------- Revenue chart ----------------
        const tsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/timeseries?days=30`,
          { headers }
        );
        const tsJson = await tsRes.json();

        setTimeseries(
          tsJson.data.map((d: any) => ({
            label: new Date(d.date).toLocaleDateString(),
            value: d.revenue / 100, // paise → INR
          }))
        );
      } catch (err) {
        console.error("Dashboard analytics load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [status, session]);

  if (loading || !overview) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="h-64 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
    </div>
  );
}


  return (
    
    <div className="space-y-10">
      <SectionHeader
  title="Overview"
  subtitle="Traffic, conversions, and revenue"
/>

      {/* ---------------- Overview ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <MetricCard
          title="Page Views"
          value={overview.pageViews}
        />
        <MetricCard
          title="Unique Visitors"
          value={overview.uniqueVisitors}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${overview.conversionRate}%`}
          positive={overview.conversionRate > 2}
        />
        <MetricCard
          title="Revenue"
          value={`₹${Math.round(overview.revenue / 100)}`}
          accent="purple"
        />
      </div>

      {/* ---------------- Revenue Trend ---------------- */}
      <SectionHeader
  title="Revenue Trend"
  subtitle="Last 30 days"
/>

      <div className="grid grid-cols-1">
        <RevenueChart data={timeseries} />
      </div>

      {/* ---------------- Funnel (next step) ---------------- */}
      {/* FunnelChart will be added here */}
      <FunnelChart days={30} />
      {/* ---------------- Page Funnel ---------------- */}
      <div className="space-y-4">
        <PageSelector
          pages={pages}
          value={selectedPageId}
          onChange={setSelectedPageId}
        />

        <PageFunnelChart pageId={selectedPageId ?? ""} />
      </div>
      {/* ---------------- Page → Product Funnel ---------------- */}
      <PageProductTable pageId={selectedPageId ?? ""} />


    </div>
  );
}
