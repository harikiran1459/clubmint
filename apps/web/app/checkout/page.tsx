"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const params = useSearchParams();
  const productIds = params?.get("productIds")?.split(",") ?? [];

  useEffect(() => {
    async function startCheckout() {
      if (productIds.length === 0) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        }
      );

      const json = await res.json();
      if (json?.url) {
        window.location.href = json.url;
      } else {
        alert("Checkout failed");
      }
    }

    startCheckout();
  }, [productIds.join(",")]);

  return <p className="p-10 text-center">Redirecting to checkout…</p>;
}
