import PricingCards from "../components/PricingCards";
import Link from "next/link";

const plans = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    subtitle: "For getting started",
    commission: "15% commission",
    features: [
      "1 paid product",
      "Basic subscriber management",
      "Manual Telegram access",
      "Community support",
    ],
  },
  {
    key: "starter",
    name: "Starter",
    price: "₹1,499",
    subtitle: "per month",
    commission: "5% commission",
    highlighted: true,
    features: [
      "Up to 5 products",
      "Telegram auto-add & auto-remove",
      "Custom creator pages",
      "Analytics dashboard",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "₹2,499",
    subtitle: "per month",
    commission: "3% commission",
    features: [
      "Unlimited products",
      "Priority Telegram automation",
      "Advanced analytics",
      "Early access to Discord & WhatsApp",
    ],
  },
];

<PricingCards
  plans={plans}
  onAction={(key) => {
    if (key === "free") {
      window.location.href = "/signup";
    } else {
      window.location.href = "/dashboard/billing";
    }
  }}
/>
