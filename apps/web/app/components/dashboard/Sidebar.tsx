"use client";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const nav = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Pages", href: "/dashboard/pages" },
    { name: "Integrations", href: "/dashboard/integrations" },
    { name: "Subscribers", href: "/dashboard/subscribers" },
    { name: "Products", href: "/dashboard/products" },
    { name: "Payments", href: "/dashboard/payments" },
    { name: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">ClubMint</div>

      <nav className="sidebar-nav">
        {nav.map((item) => (
          <button
            key={item.href}
            className={`sidebar-link ${
              pathname === item.href ? "active" : ""
            }`}
            onClick={() => router.push(item.href)}
          >
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
