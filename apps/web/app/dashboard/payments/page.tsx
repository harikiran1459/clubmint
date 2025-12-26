"use client";
// apps/web/app/dashboard/payments/page.tsx

import { useEffect, useState } from "react";
import { PRICING_PLANS_UI } from "../../../lib/plans";
import { useSession } from "next-auth/react";
import PricingCards from "../../components/PricingCards";


export default function BillingPage() {
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [upgrading, setUpgrading] = useState<string | null>(null);




  useEffect(() => {
    if (status !== "authenticated") return;

  async function loadBilling() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/billing/me`,
      {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      }
    );

    const json = await res.json();
    setCreator(json.creator);
    setLoading(false);
  }

  loadBilling();
}, [status, session]);

  async function upgrade(plan: string) {
    setUpgrading(plan);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/billing/upgrade`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
      body: JSON.stringify({ plan }),
    }
  );

  const data = await res.json();
  console.log("UPGRADE RESPONSE:", data);

  if (!data.subscriptionId) {
    alert("Subscription creation failed");
    return;
  }

  const options = {
    key: data.key,
    subscription_id: data.subscriptionId,
    name: "ClubMint",
    description: "Creator subscription",
    theme: { color: "#7c3aed" },
    handler: function () {
      window.location.reload();
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}


  if (loading) return <p>Loading billing details...</p>;
  if (!creator) {
  return (
    <div className="p-10 text-center text-gray-400">
      Loading billing details...
    </div>
  );
}


  return (
    <PricingCards
  plans={PRICING_PLANS_UI}
  currentPlan={creator.plan}
  onAction={upgrade}
  upgradingPlan={upgrading}
/>

  );
}
