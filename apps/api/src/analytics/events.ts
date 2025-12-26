export const ANALYTICS_EVENTS = {
  // Acquisition
  PAGE_VIEW: "page_view",
  PRICING_VIEW: "pricing_view",

  // Engagement
  CTA_CLICK: "cta_click",

  // Checkout
  CHECKOUT_VIEW: "checkout_view",
  CHECKOUT_START: "checkout_start",

  // Payments
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",

  // Subscriptions
  SUBSCRIPTION_CREATED: "subscription_created",
  SUBSCRIPTION_RENEWED: "subscription_renewed",
  SUBSCRIPTION_CANCELED: "subscription_canceled",
  SUBSCRIPTION_EXPIRED: "subscription_expired",

  // Access
  ACCESS_GRANTED: "access_granted",
  ACCESS_REVOKED: "access_revoked",
  TELEGRAM_VERIFIED: "telegram_verified",
} as const;

export type AnalyticsEventName =
  typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
