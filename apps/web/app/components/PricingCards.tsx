"use client";

import { Check } from "lucide-react";

export type Plan = {
  key: string;
  name: string;
  price: string;
  subtitle: string;
  commission: string;
  features: string[];
  highlighted?: boolean;
};

export default function PricingCards({
  plans,
  currentPlan,
  onAction,
  upgradingPlan,
}: {
  plans: Plan[];
  currentPlan?: string;
  onAction: (planKey: string) => void;
  upgradingPlan?: string | null;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {plans.map((plan) => {
        const isCurrent = currentPlan === plan.key;
        const isUpgrading = upgradingPlan === plan.key;
        const isBusy = Boolean(upgradingPlan);

        const buttonLabel = isCurrent
          ? "Current Plan"
          : plan.key === "free"
          ? "Downgrade to Free"
          : `Upgrade to ${plan.name}`;

        return (
          <div
            key={plan.key}
            className={`relative rounded-2xl border ${
              plan.highlighted
                ? "border-purple-500 shadow-purple-500/30"
                : "border-white/10"
            } bg-white/5 backdrop-blur-xl p-8`}
          >
            {/* Badge */}
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-sm px-4 py-1 rounded-full">
                Most Popular
              </div>
            )}

            {/* Title */}
            <h3 className="text-2xl font-semibold mb-1">
              {plan.name}
            </h3>
            <p className="text-white/60 mb-6">
              {plan.subtitle}
            </p>

            {/* Price */}
            <div className="mb-4">
              <span className="text-4xl font-bold">
                {plan.price}
              </span>
              {plan.price !== "₹0" && (
                <span className="text-white/60 ml-2">
                  / month
                </span>
              )}
            </div>

            {/* Commission */}
            <p className="text-purple-400 font-medium mb-6">
              {plan.commission}
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3"
                >
                  <Check
                    className="text-green-400 mt-1"
                    size={18}
                  />
                  <span className="text-white/80">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              disabled={isCurrent || isBusy}
              onClick={() => onAction(plan.key)}
              className={`w-full rounded-xl py-3 font-medium transition ${
                isCurrent
                  ? "bg-white/10 cursor-not-allowed opacity-60"
                  : isUpgrading
                  ? "bg-purple-600 opacity-80 cursor-wait"
                  : plan.highlighted
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {isUpgrading ? "Processing…" : buttonLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}
