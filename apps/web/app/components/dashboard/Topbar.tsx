"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Topbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const displayName =
    session?.user?.name ||
    session?.user?.email ||
    "User";

  const avatarSrc = session?.user?.image
    ? `${session.user.image}?v=${Date.now()}`
    : null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-neutral-900 backdrop-blur-xl">
      {/* LEFT */}
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg text-m font-small text-white/70 hover:text-white hover:bg-white/5 transition"
        >
          Dashboard
        </Link>

        <Link
          href="/my-access"
          className="px-4 py-2 rounded-lg text-m font-small text-white/70 hover:text-white hover:bg-white/5 transition"
        >
          My Access
        </Link>
      </div>

      {/* RIGHT */}
      <div className="relative flex items-center gap-3">
        {/* User meta */}
        <div className="text-right leading-tight">
          <div className="text-sm font-medium">
            {displayName}
          </div>
          {session?.user?.creatorHandle && (
            <div className="text-xs text-white/50">
              @{session.user.creatorHandle}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button
          onClick={() => setOpen(!open)}
          className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/40 to-pink-500/40 border border-white/10 hover:ring-2 hover:ring-purple-500/40 transition"
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold">
              {(displayName[0] || "U").toUpperCase()}
            </div>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-12 w-48 rounded-xl bg-[#111] border border-white/10 shadow-2xl overflow-hidden z-50">
            <DropdownLink href="/dashboard">
              Dashboard
            </DropdownLink>
            <DropdownLink href="/dashboard/pages">
              Pages
            </DropdownLink>
            <DropdownLink href="/dashboard/integrations">
              Integrations
            </DropdownLink>
            <DropdownLink href="/dashboard/payouts">
              Payouts
            </DropdownLink>

            <DropdownLink href="/dashboard/products">
              Products
            </DropdownLink>

            <DropdownLink href="/dashboard/settings">
              Settings
            </DropdownLink>

            <div className="border-t border-white/10" />

            <button
              onClick={() =>
                signOut({ callbackUrl: "/login" })
              }
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------- */

function DropdownLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 text-sm hover:bg-white/5"
    >
      {children}
    </Link>
  );
}
