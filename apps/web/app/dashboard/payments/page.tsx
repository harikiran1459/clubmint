"use client";
// apps/web/app/dashboard/payments/page.tsx

import { useEffect, useState } from "react";
import { PricingPlanUI, mapPricingToUI } from "../../../lib/plans";
import { useSession } from "next-auth/react";
import PricingCards from "../../components/PricingCards";

export default function BillingPage() {
  const { data: session, status } = useSession();

  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [plans, setPlans] = useState<PricingPlanUI[]>([]);


  /* ---------------- Load billing state ---------------- */
 useEffect(() => {
  if (status !== "authenticated") return;

  async function loadBilling() {
    const token = session?.user?.accessToken;
    if (!token) return;

    const [billingRes, pricingRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing`),
    ]);

    const billingJson = await billingRes.json();
    const pricingJson = await pricingRes.json();

    if (billingJson.ok) setCreator(billingJson.creator);
    if (pricingJson.ok)
      setPlans(mapPricingToUI(pricingJson.plans));

    setLoading(false);
  }

  loadBilling();
}, [status, session]);


  /* ---------------- Upgrade handler ---------------- */
  async function upgrade(plan: string) {
    if (upgrading) return; // prevent double-clicks

    setUpgrading(plan);

    try {
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

      if (!data.subscriptionId) {
        throw new Error("Subscription creation failed");
      }

      const options = {
        key: data.key,
        subscription_id: data.subscriptionId,
        name: "ClubMint",
        description: "Creator subscription",
        theme: { color: "#7c3aed" },
        handler: () => {
          window.location.reload();
        },
        modal: {
          ondismiss: () => {
            setUpgrading(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("Failed to start subscription. Please try again.");
      setUpgrading(null);
    }
  }

  /* ---------------- UI states ---------------- */
  if (status === "loading" || loading) {
    return (
      <div className="p-10 text-white/60">
        Loading billing details…
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="p-10 text-center text-gray-400">
        Unable to load billing information.
      </div>  
    );
  }

  /* ---------------- Render ---------------- */
  return (
    <PricingCards
  plans={plans}
  currentPlan={creator.plan}
  onAction={upgrade}
  upgradingPlan={upgrading}
/>
  );
}