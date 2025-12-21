export const CLUBMINT_PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "1 product",
      "1 Telegram group",
      "15% platform commission",
    ],
  },
  starter: {
    name: "Starter",
    price: 999,
    features: [
      "Up to 3 products",
      "Up to 3 Telegram groups",
      "5% platform commission",
      "Basic analytics",
    ],
  },
  pro: {
    name: "Pro",
    price: 2499,
    features: [
      "Unlimited products",
      "Unlimited Telegram groups",
      "3% platform commission",
      "Advanced analytics",
      "Custom domain",
      "Priority support",
    ],
  },
} as const;
