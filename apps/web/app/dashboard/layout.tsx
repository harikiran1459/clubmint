"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    // Not logged in
    if (!session) {
      router.replace("/login");
      return;
    }

    const token = session.user.accessToken;
    if (!token) {
      router.replace("/login");
      return;
    }

    // 🔑 VERIFY CREATOR FROM BACKEND
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/creator-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok || !json.isCreator) {
          router.replace("/my-access");
        } else {
          setAllowed(true);
        }
      });
  }, [status, session]);

  if (!allowed) return null;

   return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
