import { CLUBMINT_PLANS } from "../../api/src/config/plans";

export type PricingPlanUI = {
  key: string;
  name: string;
  price: string;
  subtitle: string;
  commission: string;
  features: string[];
  highlighted?: boolean;
};

export const PRICING_PLANS_UI: PricingPlanUI[] = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    subtitle: "/month",
    commission: `${CLUBMINT_PLANS.free.commissionPct}% commission`,
    features: [
      "1 paid product",
      "1 Telegram group",
      "15% platform commission",
      "Community support",
    ],
  },
  {
    key: "starter",
    name: "Starter",
    price: "₹999",
    subtitle: "/month",
    commission: `${CLUBMINT_PLANS.starter.commissionPct}% commission`,
    highlighted: true,
    features: [
      "Up to 3 products",
      "Up to 3 Telegram groups",
      "5% platform commission",
      "Analytics dashboard",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "₹2,499",
    subtitle: "/month",
    commission: `${CLUBMINT_PLANS.pro.commissionPct}% commission`,
    features: [
      "Unlimited products",
      "Unlimited Telegram groups",
      "3% platform commission",
      "Priority support",
    ],
  },
];
