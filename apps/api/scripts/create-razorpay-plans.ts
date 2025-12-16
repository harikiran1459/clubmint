// // apps/api/scripts/create-razorpay-plans.ts
// import "dotenv/config";
// import { razorpay } from "../src/lib/razorpay";
// import { CLUBMINT_PLANS } from "../src/config/plans";

// async function createPlans() {
//   for (const plan of CLUBMINT_PLANS) {
//     if (plan.price === 0) {
//       console.log(`⏭️ Skipping free plan`);
//       continue;
//     }

//     console.log(`Creating Razorpay plan for ${plan.name}...`);

//     const response = await razorpay.plans.create({
//       period: "monthly",
//       interval: 1,
//       item: {
//         name: `ClubMint ${plan.name}`,
//         amount: plan.price * 100, // ₹ → paise
//         currency: "INR",
//         description: `${plan.name} plan (${plan.commissionPct}% commission)`,
//       },
//     });

//     console.log(
//       `✅ ${plan.name} Razorpay Plan ID:`,
//       response.id
//     );
//   }
// }

// createPlans()
//   .then(() => {
//     console.log("🎉 All Razorpay plans processed");
//     process.exit(0);
//   })
//   .catch((err) => {
//     console.error("❌ Failed to create plans", err);
//     process.exit(1);
//   });
