import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createAlert(
  creatorId: string,
  type: string,
  message: string,
  metadata?: any
) {
  return prisma.alert.create({
    data: {
      creatorId,
      type,
      message,
      metadata,
    },
  });
}
