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
    razorpayPlanId: process.env.RAZORPAY_PLAN_STARTER,
    features: {
      telegramGroups: 3,
      products: 3,
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
    razorpayPlanId: process.env.RAZORPAY_PLAN_PRO,
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
