// import { Router } from "express";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const router = Router();

// /**
//  * GET /payments/by-user/:userId
//  */
// router.get("/by-user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const payments = await prisma.payment.findMany({
//       where: {
//         creatorId: userId
//       },
//       orderBy: { createdAt: "desc" }
//     });

//     res.json(payments);
//   } catch (err) {
//     console.error("Payment fetch error:", err);
//     res.status(500).json({ error: "Failed to fetch payments" });
//   }
// });

// export default router;
