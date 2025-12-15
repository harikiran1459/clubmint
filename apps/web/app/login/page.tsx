import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading login…</div>}>
      <LoginClient />
    </Suspense>
  );
}
