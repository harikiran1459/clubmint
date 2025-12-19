"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutClient() {
  const params = useSearchParams();
  const productId = params?.get("productId");

  useEffect(() => {
    async function startCheckout() {
      if (!productId) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }
      );

      const data = await res.json();

      if (!data.orderId) {
        alert("Checkout failed");
        return;
      }

      const options = {
        key: data.key,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "ClubMint",
        description: data.productTitle,
        theme: { color: "#7c3aed" },
        handler: function () {
          window.location.href = "/success";
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    }

    startCheckout();
  }, [productId]);

  return (
    <p className="p-10 text-center text-white/70">
      Redirecting to secure checkout…
    </p>
  );
}
