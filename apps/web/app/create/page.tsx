"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function BecomeCreatorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* --------------------------------------------------
     AUTH GUARD
  -------------------------------------------------- */
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login");
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen items-center justify-center text-white/60">
        Checking authentication…
      </div>
    );
  }

  /* --------------------------------------------------
     SUBMIT
  -------------------------------------------------- */
  async function submit() {
    if (!handle.trim()) {
      setError("Handle is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = (session?.user as any).accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/creators/onboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ handle, bio }),
        }
      );

      const json = await res.json();

      if (!json.ok || !json.token) {
        setError(json.error || "Failed to create creator");
        setLoading(false);
        return;
      }

      /**
       * 🔑 CRITICAL:
       * Re-authenticate with NEW token that contains creatorId
       */
      await signIn("credentials", {
        email: session?.user.email,
  password: undefined,          // ignored
  token: json.token,            // 👈 fresh backend token
  redirect: false,
      });

      /**
       * Now JWT + session are aligned
       */
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute glow glow-purple" />
      <div className="absolute glow glow-pink" />

      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-10">
        <h1 className="text-3xl font-bold text-center">
          Become a <span className="gradient-text">creator</span>
        </h1>

        <p className="mt-3 text-center text-white/60">
          Start selling access to your Telegram, Discord or WhatsApp community.
        </p>

        <div className="mt-10 space-y-6">
          <div>
            <label className="text-sm text-white/80">
              Your creator handle
            </label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="yourname"
              className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-4 py-2"
            />
            <p className="mt-1 text-xs text-white/40">
              clubmint.com/{handle || "yourname"}
            </p>
          </div>

          <div>
            <label className="text-sm text-white/80">
              Short bio (optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-4 py-2"
              placeholder="What do you sell?"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold disabled:opacity-60"
          >
            {loading
              ? "Creating creator account…"
              : "Create creator account"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          You start on the free plan. Upgrade anytime.
        </p>
      </div>
    </main>
  );
}
