"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [checking, setChecking] = useState(false);
  const [accessReady, setAccessReady] = useState(false);

  // ------------------------------------------------
  // If logged in, check access status
  // ------------------------------------------------
  useEffect(() => {
    if (status !== "authenticated") return;

    const token = (session?.user as any)?.accessToken;
    if (!token) return;

    setChecking(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/access/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.hasAccess) {
          setAccessReady(true);
        }
      })
      .finally(() => setChecking(false));
  }, [status, session]);

  // ------------------------------------------------
  // UI
  // ------------------------------------------------
  if (status === "loading") {
    return <Centered>Checking payment…</Centered>;
  }

  // ------------------------------------------------
  // CASE 1: Buyer NOT logged in
  // ------------------------------------------------
  if (status !== "authenticated") {
    return (
      <Centered>
        <h1 className="text-3xl font-bold mb-4">🎉 Payment successful</h1>
        <p className="text-white/70 mb-6 max-w-md">
          We’ve received your payment.  
          One last step to activate your community access.
        </p>

        <button
          onClick={() => signIn(undefined, { callbackUrl: "/success" })}
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

  // ------------------------------------------------
  // CASE 2: Logged in, access still processing
  // ------------------------------------------------
  if (!accessReady) {
  return (
    <Centered>
      <h1 className="text-3xl font-bold mb-4">Payment confirmed</h1>
      <p className="text-white/70 mb-6">
        Your payment was successful.  
        Access is being activated.
      </p>

      <button
        onClick={() => router.push("/dashboard")}
        className="bg-purple-600 px-6 py-3 rounded-xl font-semibold"
      >
        Go to dashboard
      </button>

      <p className="mt-4 text-sm text-white/50">
        If access is not active yet, it will appear shortly.
      </p>
    </Centered>
  );
}


  // ------------------------------------------------
  // CASE 3: Logged in, access ready
  // ------------------------------------------------
  return (
    <Centered>
      <h1 className="text-3xl font-bold mb-4">🎉 You’re in!</h1>
      <p className="text-white/70 mb-6">
        Your access has been activated successfully.
      </p>

      <button
        onClick={() => router.push("/dashboard")}
        className="bg-purple-600 px-6 py-3 rounded-xl font-semibold"
      >
        Go to dashboard
      </button>
    </Centered>
  );
}

// ------------------------------------------------
// Helper layout
// ------------------------------------------------
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      {children}
    </div>
  );
}
