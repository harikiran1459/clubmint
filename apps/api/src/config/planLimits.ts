export const PLAN_LIMITS = {
  free: {
    products: 1,
    telegramGroups: 1,
    autoAdd: 1,
  },
  starter: {
    products: 5,
    telegramGroups: 5,
    autoAdd: Infinity,
  },
  pro: {
    products: Infinity,
    telegramGroups: Infinity,
    autoAdd: Infinity,
  },
} as const;
