"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Right side */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <Topbar />

        {/* Main content */}
        <main className="dashboard-content">
          {children}
        </main>

      </div>
    </div>
  );
}
