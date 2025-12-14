"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function Topbar() {
  const [name, setName] = useState("User");

  useEffect(() => {
    // runs only in the browser
    const stored = localStorage.getItem("userName");
    if (stored) setName(stored);
  }, []);

  function toggleSidebar() {
    const el = document.querySelector(".sidebar");
    el?.classList.toggle("open");
  }

  return (
    <div className="topbar">
      <Menu className="topbar-menu-btn" onClick={toggleSidebar} />

      <div className="topbar-user">
        <div className="user-avatar">{name.charAt(0).toUpperCase()}</div>
        <span>{name}</span>
      </div>
    </div>
  );
}
