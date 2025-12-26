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
        // base
        "relative rounded-xl p-6 backdrop-blur-xl",
        "transition-all duration-200 ease-out",

        // background + border
        subtle
          ? "bg-white/3 border border-white/5"
          : "bg-white/5 border border-white/10",

        // hover polish
        !subtle &&
          "hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.03)] hover:-translate-y-[1px]"
      )}
    >
      {/* Title */}
      <p className="text-xs font-medium uppercase tracking-wide text-white/50 mb-2">
        {title}
      </p>

      {/* Value */}
      <p
        className={clsx(
          "text-3xl font-semibold leading-tight",
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
