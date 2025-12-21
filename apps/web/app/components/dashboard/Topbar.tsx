"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Topbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const displayName =
    session?.user?.name || session?.user?.email || "User";

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      {/* LEFT */}
      <div className="flex gap-6">
      <div className=" p-3 bg-neutral-800 border-neutral rounded-lg flex gap-6">
  <a
    href="/dashboard"
    className="text-m text-white/70 hover:text-white"
  >
    Dashboard
  </a>
  </div>
  <div className="bg-black/30 p-3 bg-neutral-800 border-white-100 rounded-lg flex gap-6">
  <a
    href="/my-access"
    className="text-m text-white/70 hover:text-white"
  >
    My Access
  </a>
</div>
</div>


      {/* RIGHT */}
      <div className="relative flex items-center gap-3">
        {/* User info */}
        <div className="text-right">
          <p className="text-sm font-medium">{displayName}</p>
          {session?.user?.creatorHandle && (
            <p className="text-xs text-white/50">
              @{session.user.creatorHandle}
            </p>
          )}
        </div>

        {/* Avatar */}
        
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full bg-purple-500/30 flex items-center justify-center"
        >
          {session?.user?.image ? (
          <img
            src={session.user.image}
            className="w-9 h-9 rounded-full object-cover"
            alt="avatar"
          />
          ) : (
            <div className="w-9 h-9 rounded-full bg-purple-500/30 flex items-center justify-center">
              <span className="text-sm font-bold">
                {(session?.user?.name || "U")[0].toUpperCase()}
              </span>
            </div>
          )}
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 top-12 w-44 rounded-lg bg-[#111] border border-white/10 shadow-xl z-50">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm hover:bg-white/5"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/payouts"
              className="block px-4 py-2 text-sm hover:bg-white/5"
            >
              Payouts
            </Link>

            <Link
              href="/dashboard/settings"
              className="block px-4 py-2 text-sm hover:bg-white/5"
            >
              Settings
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
