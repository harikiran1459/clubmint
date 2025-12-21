"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    const creatorId = (session?.user as any)?.creatorId;

    // 🔑 SINGLE SOURCE OF TRUTH
    if (creatorId) {
      router.replace("/dashboard");
    } else {
      router.replace("/my-access");
    }
  }, [status, session, router]);

  return (
    <div className="flex h-screen items-center justify-center text-white/60">
      Redirecting…
    </div>
  );
}
