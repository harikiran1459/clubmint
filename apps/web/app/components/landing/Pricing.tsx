"use client";

import { CLUBMINT_PLANS } from "../../../lib/plans";

export default function PricingCards({
  currentPlan,
  onUpgrade,
}: {
  currentPlan?: string;
  onUpgrade?: (plan: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(CLUBMINT_PLANS).map(([key, plan]) => {
        const isCurrent = currentPlan === key;

        return (
          <div
            key={key}
            className={`relative rounded-2xl p-6 border backdrop-blur-xl
              ${
                isCurrent
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }
            `}
          >
            {isCurrent && (
              <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-purple-600">
                Current
              </span>
            )}

            <h3 className="text-xl font-semibold">{plan.name}</h3>

            <p className="mt-4 text-3xl font-bold">
              ₹{plan.price}
              {plan.price > 0 && (
                <span className="text-sm font-normal opacity-70"> / month</span>
              )}
            </p>

            <ul className="mt-6 space-y-2 text-sm opacity-80">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>

            {onUpgrade && !isCurrent && (
              <button
                onClick={() => onUpgrade(key)}
                className="mt-6 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
              >
                Upgrade
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
