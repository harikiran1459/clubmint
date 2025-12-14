// apps/web/app/create/page.tsx
"use client";

import axios from "axios";
import { useState } from "react";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";


export default function Create() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");
  const { data: session } = useSession();
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const body = {
    productId: "01",
    customerEmail: "buyer@example.com",
    amountCents: 499,
    currency: "usd",
    interval: "month",
    productName: "Premium Community Access",
    successUrl: `${origin}/success`,
    cancelUrl: `${origin}/cancel`,
  };

  async function createCheckout() {
  setLoading(true);
  try {
    const productId = "01"; // <-- REQUIRED

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/create-checkout`,
      body,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );

    localStorage.setItem("userId", res.data.userId);

    window.location.href = res.data.url;


    const checkoutUrl = res.data.url;
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      alert("No checkout URL returned from server.");
    }
  } catch (err) {
    console.error("createCheckout err:", err);
    alert("Failed to create checkout session.");
  } finally {
    setLoading(false);
  }
}


  return (
    <div style={{ padding: 40 }}>
      <h2>Create Stripe Checkout</h2>
      <p>Example: $4.99 monthly subscription (Stripe Checkout)</p>
      <button onClick={createCheckout} disabled={loading}>
        {loading ? "Creating..." : "Create checkout and go to Stripe"}
      </button>
      {url && (
        <div style={{ marginTop: 12 }}>
          <a href={url} target="_blank" rel="noreferrer">
            Open checkout in new tab
          </a>
        </div>
      )}
    </div>
  );
}
