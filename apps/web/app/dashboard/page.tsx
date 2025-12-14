"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import MetricCard from "../components/dashboard/MetricCard";

import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.userId;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats/${userId}`
        );
        const json = await res.json();
        setStats(json);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading || !stats) {
    return (
      <main className="auth-wrapper">
        <div className="glow glow-purple"></div>
        <div className="glow glow-pink"></div>
        <div className="auth-card">Loading dashboard…</div>
      </main>
    );
  }

  return (
    <div className="dashboard-layout">

      {/* Right side */}
      <div style={{ flex: 1 }}>

        <div className="dashboard-content">

          <h1 className="dashboard-title">Creator Dashboard</h1>

          {/* METRICS */}
          <div className="metric-grid">
            <MetricCard label="Subscribers" value={stats.subscriberCount} />

            <MetricCard
              label="Monthly Revenue"
              value={`$${(stats.monthlyRevenue / 100).toFixed(2)}`}
            />

            <MetricCard
              label="Telegram Connected"
              value={stats.telegramLinked ? "Yes" : "No"}
            />
          </div>

          {/* GRAPHS */}
          <div className="grid-2-col">
            {/* Revenue Trend */}
            <div className="chart-card">
              <h2 className="chart-title">Revenue Trend</h2>

              {!stats.revenueGraph?.length ? (
                <div className="no-data">No revenue data available</div>
              ) : (
                <Line
                  data={{
                    labels: stats.revenueGraph.map((p: any) => p.date),
                    datasets: [
                      {
                        label: "Revenue ($)",
                        data: stats.revenueGraph.map((p: any) => p.amount / 100),
                        borderColor: "#a855f7",
                        borderWidth: 2,
                        tension: 0.4,
                      },
                    ],
                  }}
                  height={140}
                />
              )}
            </div>

            {/* Subscriber Trend */}
            <div className="chart-card">
              <h2 className="chart-title">Subscribers Growth</h2>

              {!stats.subscriberGraph?.length ? (
                <div className="no-data">No subscriber data available</div>
              ) : (
                <Bar
                  data={{
                    labels: stats.subscriberGraph.map((p: any) => p.date),
                    datasets: [
                      {
                        label: "Subscribers",
                        data: stats.subscriberGraph.map((p: any) => p.count),
                        backgroundColor: "#3b82f6",
                      },
                    ],
                  }}
                  height={140}
                />
              )}
            </div>
          </div>

          {/* FOOTER */}
          <footer className="footer">
            ClubMint © {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </div>
  );
}
