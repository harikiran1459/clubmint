import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function logActivity({
  creatorId,
  groupId,
  tgUserId,
  event,
  reason,
}: {
  creatorId: string;
  groupId: string;
  tgUserId: bigint;
  event: string;
  reason?: string;
}) {
  await prisma.telegramActivityLog.create({
    data: {
      creatorId,
      groupId,
      tgUserId,
      event,
      reason: reason || null,
    },
  });
}
