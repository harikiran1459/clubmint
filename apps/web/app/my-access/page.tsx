"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type AccessItem = {
  id: string;
  productTitle: string;
  creatorHandle: string;
  platform: string;
  inviteUrl: string | null;
  status: "active" | "pending" | "revoked";
};

export default function MyAccessPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessItem[]>([]);
  const [isCreator, setIsCreator] = useState(false);

useEffect(() => {
  if (status !== "authenticated") return;

  const token = (session?.user as any)?.accessToken;
  if (!token) {
    setLoading(false);
    return;
  }

  (async () => {
    try {
      // 1. Load access
      const accessRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/me/access`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const accessJson = await accessRes.json();
      if (accessJson.ok) {
        setAccess(accessJson.access);
      }

      // 2. Load creator status (THIS WAS MISSING)
      const creatorRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/me/creator-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const creatorJson = await creatorRes.json();
      if (creatorJson.ok) {
        setIsCreator(creatorJson.isCreator);
      }
    } catch (err) {
      console.error("MyAccess load error:", err);
    } finally {
      setLoading(false);
    }
  })();
}, [status, session]);


  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-white/60">
        Loading your access…
      </div>
    );
  }

  return (
    
    <main className="min-h-screen bg-black text-white">
      
      {/* glow */}
      <div className="glow glow-purple"></div>
      <div className="glow glow-pink"></div>

      <div className="max-w-5xl mx-auto py-12">
        <div className="flex justify-between items-center mb-2">
        <h1 className="text-4xl font-bold mb-2">My Access</h1>
        {isCreator && (<div className=" p-3 bg-neutral-800 border-neutral rounded-lg flex gap-6">
  <a
    href="/dashboard"
    className="text-m text-white/70 hover:text-white"
  >
    Go to Dashboard
  </a>
  </div>)}
  </div>
        <p className="text-white/60 mb-10">
          Everything you’ve unlocked on ClubMint
        </p>

        {access.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {access.map((a: any) => {
    const statusColor =
      a.status === "active"
        ? "text-green-400"
        : a.status === "pending"
        ? "text-yellow-400"
        : "text-red-400";

    return (
      <div
        key={a.id}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm uppercase tracking-wide text-white/60">
            {a.platform}
          </div>
          <div className={`text-sm font-medium ${statusColor}`}>
            {a.status}
          </div>
        </div>

        {/* Product */}
        <div className="text-lg font-semibold">
          {a.productTitle}
        </div>
        <div className="text-sm text-white/60 mb-4">
          by @{a.creatorHandle}
        </div>

        {/* Lifecycle */}
        <div className="space-y-1 text-sm text-white/70">
  <div>
    Granted on{" "}
    <span className="text-white">
      {new Date(a.grantedAt).toDateString()}
    </span>
  </div>

  {a.currentPeriodEnd && (
    <div>
      Renews on{" "}
      <span className="text-white">
        {new Date(a.currentPeriodEnd).toDateString()}
      </span>
    </div>
  )}

  {a.kickAfter && (
    <div>
      Access ends on{" "}
      <span className="text-white">
        {new Date(a.kickAfter).toDateString()}
      </span>
    </div>
  )}
</div>


        {/* Action */}
        <div className="mt-6">
          {a.status === "active" && a.inviteUrl ? (
            <a
              href={a.inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-purple-600 px-6 py-2 text-sm font-semibold hover:bg-purple-700 transition"
            >
              Open {a.platform}
            </a>
          ) : a.status === "pending" ? (
            <div className="text-sm text-white/60">
              Access is being activated…
            </div>
          ) : (
            <div className="text-sm text-white/50">
              Access expired
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>

        )}
        {!isCreator &&(<div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center space-y-4 mt-7 mb-7">
  <div>
    <div className="font-semibold text-lg">
      Want to start your own community?
    </div>
    <div className="text-sm text-white/60">
      Create a page, sell access, and manage subscribers.
    </div>
  </div>

  <a
    href="/create"
    className="inline-block rounded-full bg-purple-600 px-6 py-3 font-medium hover:bg-purple-700"
  >
    Become a creator
  </a>
</div>)}

      </div>
      
    </main>
  );
}

/* ---------------------------------------------
   ACCESS CARD
---------------------------------------------- */

function AccessCard({ item }: { item: AccessItem }) {
  const isActive = item.status === "active";

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">
            @{item.creatorHandle}
          </div>
          <div className="text-xl font-semibold mt-1">
            {item.productTitle}
          </div>
        </div>

        <StatusPill status={item.status} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <PlatformBadge platform={item.platform} />

        {isActive && item.inviteUrl ? (
          <a
            href={item.inviteUrl}
            target="_blank"
            className="rounded-full bg-purple-600 px-5 py-2 text-sm font-medium hover:bg-purple-700 transition"
          >
            Join now →
          </a>
        ) : (
          <button
            disabled
            className="rounded-full bg-white/10 px-5 py-2 text-sm opacity-60"
          >
            {item.status === "pending"
              ? "Setting up…"
              : "Access revoked"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------
   SMALL COMPONENTS
---------------------------------------------- */

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "active"
      ? "bg-green-500/20 text-green-400"
      : status === "pending"
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-red-500/20 text-red-400";

  return (
    <span className={`rounded-full px-3 py-1 text-xs ${styles}`}>
      {status}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className="rounded-lg bg-white/10 px-3 py-1 text-xs uppercase tracking-wide">
      {platform}
    </span>
  );
}

/* ---------------------------------------------
   EMPTY STATE
---------------------------------------------- */

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center mt-5 mb-3">
      <h2 className="text-2xl font-semibold mb-2">
        You don’t have access to any communities yet.
      </h2>
      <p className="text-white/60 mb-6">
        When you purchase a creator’s product, it’ll appear here.
      </p>

      <a
        href="/"
        className="inline-block rounded-full bg-purple-600 px-6 py-3 font-medium hover:bg-purple-700"
      >
        Explore creators
      </a>
    </div>
  );
}
