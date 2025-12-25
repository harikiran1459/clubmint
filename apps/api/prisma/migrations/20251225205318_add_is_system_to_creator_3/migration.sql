/*
  Warnings:

  - A unique constraint covering the columns `[claimCode]` on the table `TelegramGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TelegramGroup" ADD COLUMN     "claimCode" TEXT;

-- CreateTable
CREATE TABLE "TelegramGroupClaim" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramGroupClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramGroupClaim_code_key" ON "TelegramGroupClaim"("code");

-- CreateIndex
CREATE INDEX "TelegramGroupClaim_code_idx" ON "TelegramGroupClaim"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramGroup_claimCode_key" ON "TelegramGroup"("claimCode");

-- AddForeignKey
ALTER TABLE "TelegramGroupClaim" ADD CONSTRAINT "TelegramGroupClaim_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
