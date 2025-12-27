export type PricingPlanUI = {
  key: "free" | "starter" | "pro";
  name: string;
  price: string;
  subtitle: string;
  commission: string;
  features: string[];
  highlighted?: boolean;
};

export function mapPricingToUI(apiPlans: any): PricingPlanUI[] {
  return Object.entries(apiPlans).map(([key, plan]: any) => ({
    key,
    name: plan.name,
    price: plan.price === 0 ? "₹0" : `₹${plan.price.toLocaleString()}`,
    subtitle: "/month",
    commission: `${plan.commissionPct}% commission`,
    highlighted: plan.highlighted,
    features: plan.features,
  }));
}
