import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runCreatorPayout(
  creatorId: string,
  periodStart: Date,
  periodEnd: Date,
  reference: string
) {
  const earnings = await prisma.creatorEarning.findMany({
    where: {
      creatorId,
      status: "PENDING",
      createdAt: {
        lte: periodEnd,
      },
    },
  });

  if (earnings.length === 0) return;

  const total = earnings.reduce((s, e) => s + e.netAmount, 0);

  const payout = await prisma.payout.create({
    data: {
      creatorId,
      totalAmount: total,
      periodStart,
      periodEnd,
    },
  });

  await prisma.creatorEarning.updateMany({
    where: {
      id: { in: earnings.map(e => e.id) },
    },
    data: {
      status: "PAID",
      payoutId: payout.id,
      paidAt: new Date(),
    },
  });

  await prisma.payout.update({
    where: { id: payout.id },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
      reference,
    },
  });
}
