"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [accessReady, setAccessReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const searchParams = useSearchParams();
  const [checkoutId, setCheckoutId] = useState<string | null>(null);


    /* --------------------------------------------
     Read URL params (SAFE)
  --------------------------------------------- */
  useEffect(() => {
    // useSearchParams is SSR-safe
    const id = searchParams?.get("checkout") ?? null;
    setCheckoutId(id);
  }, [searchParams]);

  /* ------------------------------------------------
     CHECK ACCESS (POLLING — WEBHOOK SAFE)
  ------------------------------------------------ */
  useEffect(() => {
    if (status !== "authenticated") return;

    const token = (session?.user as any)?.accessToken;
    if (!token) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 6;

    async function checkAccess() {
      attempts++;
      setChecking(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/access/status?checkout=${checkoutId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();

        if (json.ok && json.hasAccess) {
          setAccessReady(true);
          return;
        }

        if (attempts < MAX_ATTEMPTS) {
          setTimeout(checkAccess, 2000);
        } else {
          setFailed(true);
        }
      } catch {
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(checkAccess, 2000);
        } else {
          setFailed(true);
        }
      } finally {
        setChecking(false);
      }
    }

    checkAccess();
  }, [status, session, checkoutId]);

  /* ------------------------------------------------
     ROUTING HELPERS
  ------------------------------------------------ */
  function goNext() {
    const role = (session?.user as any)?.role;

    if (role === "creator") {
      router.push("/dashboard");
    } else {
      router.push("/my-access"); // buyer destination
    }
  }

  /* ------------------------------------------------
     UI STATES
  ------------------------------------------------ */
  if (status === "loading") {
    return <Centered>Checking payment…</Centered>;
  }

if (!checkoutId) {
  return (
    <Centered>
      <h1 className="text-2xl font-semibold">Nothing to confirm</h1>
      <p className="text-white/60 mt-3">
        This page is shown only after a successful payment.
      </p>

      <button
        onClick={() => router.push("/")}
        className="mt-6 bg-purple-600 px-6 py-3 rounded-xl font-semibold"
      >
        Go home
      </button>
    </Centered>
  );
}


  /* -------- Buyer not logged in -------- */
  if (status !== "authenticated") {
    return (
      <Centered>
        <h1 className="text-3xl font-bold mb-4">🎉 Payment successful</h1>

        <p className="text-white/70 mb-6 max-w-md">
          Your payment was received.  
          Sign in to activate and view your access.
        </p>

        <button
          onClick={() =>
            signIn(undefined, {
              callbackUrl: `/success${checkoutId ? `?checkout=${checkoutId}` : ""}`,
            })
          }
          className="bg-purple-600 px-6 py-3 rounded-xl font-semibold"
        >
          Continue to sign in
        </button>

        <p className="mt-4 text-sm text-white/50">
          No additional payment required.
        </p>
      </Centered>
    );
  }

  /* -------- Logged in, waiting for webhook -------- */
  if (!accessReady && !failed) {
    return (
      <Centered>
        <h1 className="text-3xl font-bold mb-4">Payment confirmed</h1>

        <p className="text-white/70 mb-6">
          Your payment was successful.  
          Activating your access…
        </p>

        <div className="animate-pulse text-white/50 text-sm">
          This usually takes a few seconds
        </div>
      </Centered>
    );
  }

  /* -------- Webhook delayed or failed -------- */
  if (failed) {
    return (
      <Centered>
        <h1 className="text-3xl font-bold mb-4">Almost there</h1>

        <p className="text-white/70 mb-6 max-w-md">
          Your payment is confirmed, but access is still syncing.  
          It will appear shortly.
        </p>

        <button
          onClick={goNext}
          className="bg-purple-600 px-6 py-3 rounded-xl font-semibold"
        >
          Continue
        </button>
      </Centered>
    );
  }

  /* -------- Access ready -------- */
  return (
    <Centered>
      <h1 className="text-3xl font-bold mb-4">🎉 You’re in!</h1>

      <p className="text-white/70 mb-6">
        Your access has been activated successfully.
      </p>

      <button
        onClick={goNext}
        className="bg-purple-600 px-6 py-3 rounded-xl font-semibold"
      >
        Continue
      </button>
    </Centered>
  );
}

/* ------------------------------------------------
   CENTERED LAYOUT
------------------------------------------------ */
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      {children}
    </div>
  );
}
