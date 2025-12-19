// apps/web/app/components/dashboard/MetricCard.tsx
"use client";

import clsx from "clsx";

type Props = {
  title: string;
  value: string | number;
  accent?: "purple" | "green" | "yellow" | "red";
  positive?: boolean;
  negative?: boolean;
  subtle?: boolean;
};

export default function MetricCard({
  title,
  value,
  accent = "purple",
  positive,
  negative,
  subtle,
}: Props) {
  const accentMap = {
    purple: "text-purple-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
  };

  return (
    <div
      className={clsx(
        "rounded-xl border bg-white/5 backdrop-blur-xl p-6",
        subtle ? "border-white/5" : "border-white/10"
      )}
    >
      <p className="text-sm text-white/60 mb-2">{title}</p>

      <p
        className={clsx(
          "text-3xl font-bold",
          positive && "text-green-400",
          negative && "text-red-400",
          !positive && !negative && accentMap[accent]
        )}
      >
        {value}
      </p>
    </div>
  );
}
