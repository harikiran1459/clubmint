/*
  Warnings:

  - Added the required column `updatedAt` to the `TelegramGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "telegramUserId" TEXT;

-- AlterTable
ALTER TABLE "TelegramGroup" ADD COLUMN     "isConnected" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT;
