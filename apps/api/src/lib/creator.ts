import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCreatorByUserId(userId?: string) {
  if (!userId) return null;

  return prisma.creator.findUnique({
    where: { userId },
  });
}