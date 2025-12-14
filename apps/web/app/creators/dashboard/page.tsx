"use client";

import Cookies from "js-cookie";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function CreatorDashboard() {
    useEffect(() => {
    const token = Cookies.get("token");
    const { data: session } = useSession();
    if (!session?.accessToken) {
        window.location.href = "/login";
    }
}, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Creator Dashboard</h1>
      {/* <p>Your userId: { (session as any).userId }</p> */}
    </div>
  );
}
