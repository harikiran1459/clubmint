export const CLUBMINT_PLANS = {
  free: {
    name: "Free",
    price: 0,
    commissionPct: 15,
    razorpayPlanId: null,
    features: {
      telegramGroups: 1,
      products: 1,
      autoAdd: true,
      analytics: true,
      customDomain: true,
      prioritySupport: false,
    },
  },

  starter: {
    name: "Starter",
    price: 999,
    commissionPct: 5,
    razorpayPlanId: "plan_RrzVNj5MyoyfjX",
    features: {
      telegramGroups: 5,
      products: 5,
      autoAdd: true,
      analytics: true,
      customDomain: true,
      prioritySupport: false,
    },
  },

  pro: {
    name: "Pro",
    price: 2499,
    commissionPct: 3,
    razorpayPlanId: "plan_RrzWws0tU3riwK",
    features: {
      telegramGroups: Infinity,
      products: Infinity,
      autoAdd: true,
      analytics: true,
      customDomain: true,
      prioritySupport: true,
    },
  },
} as const;
