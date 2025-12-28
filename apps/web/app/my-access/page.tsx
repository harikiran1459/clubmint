"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AccessItem = {
  id: string;
  productTitle: string;
  creatorHandle: string;
  platform: string;
  inviteUrl: string | null;
  status: "active" | "pending" | "revoked";
};

export default function MyAccessPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessItem[]>([]);

  /* --------------------------------------------------
     AUTH GUARD
  -------------------------------------------------- */
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login");
  }, [status, session, router]);

  /* --------------------------------------------------
     LOAD ACCESS (JWT is authority)
  -------------------------------------------------- */
  useEffect(() => {
    if (status !== "authenticated") return;

    const token = (session?.user as any)?.accessToken;
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/me/access`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const json = await res.json();
        if (json.ok) setAccess(json.access);
      } catch (err) {
        console.error("MyAccess load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [status, session]);

  /* --------------------------------------------------
     STATE
  -------------------------------------------------- */
  const isCreator = Boolean((session?.user as any)?.creatorId);

  if (loading || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-white/60">
        Loading your access…
      </div>
    );
  }

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="glow glow-purple"></div>
      <div className="glow glow-pink"></div>

      <div className="max-w-5xl mx-auto py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold">My Access</h1>

          {isCreator && (
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-white/70 hover:text-white"
            >
              Go to Dashboard
            </button>
          )}
        </div>

        <p className="text-white/60 mb-10">
          Everything you’ve unlocked on ClubMint
        </p>

        {/* Access cards */}
        {access.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {access.map((a) => {
              const statusColor =
                a.status === "active"
                  ? "text-green-400"
                  : a.status === "pending"
                  ? "text-yellow-400"
                  : "text-red-400";

              return (
                <div
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex justify-between mb-4">
                    <span className="text-sm uppercase text-white/60">
                      {a.platform}
                    </span>
                    <span className={`text-sm ${statusColor}`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="text-lg font-semibold">
                    {a.productTitle}
                  </div>
                  <div className="text-sm text-white/60 mb-4">
                    by @{a.creatorHandle}
                  </div>

                  <div className="mt-6">
                    {a.status === "active" && a.inviteUrl ? (
                      <a
                        href={a.inviteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block rounded-full bg-purple-600 px-6 py-2 text-sm font-semibold hover:bg-purple-700"
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

        {/* Become creator CTA */}
        {!isCreator && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <h3 className="text-lg font-semibold mb-1">
              Want to start your own community?
            </h3>
            <p className="text-sm text-white/60 mb-5">
              Create a page, sell access, and manage subscribers.
            </p>
            <button
              onClick={() => router.push("/create")}
              className="inline-block rounded-full bg-purple-600 px-6 py-3 font-medium hover:bg-purple-700"
            >
              Become a creator
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------------------------- */

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
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
