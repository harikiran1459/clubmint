import { Suspense } from "react";
import SuccessClient from "./success-client";

export const dynamic = "force-dynamic";

export default function SuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuccessClient />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-white/60">
      Finalizing payment…
    </div>
  );
}
