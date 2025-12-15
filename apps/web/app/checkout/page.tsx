import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center">Loading checkout…</p>}>
      <CheckoutClient />
    </Suspense>
  );
}
