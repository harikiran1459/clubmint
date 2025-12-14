/*
  Warnings:

  - You are about to drop the column `telegramGroupId` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `telegramUserId` on the `TelegramGroup` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `TelegramUser` table. All the data in the column will be lost.
  - Added the required column `userId` to the `TelegramUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TelegramGroup" DROP CONSTRAINT "TelegramGroup_telegramUserId_fkey";

-- DropForeignKey
ALTER TABLE "TelegramUser" DROP CONSTRAINT "TelegramUser_creatorId_fkey";

-- AlterTable
ALTER TABLE "Creator" DROP COLUMN "telegramGroupId";

-- AlterTable
ALTER TABLE "TelegramGroup" DROP COLUMN "telegramUserId";

-- AlterTable
ALTER TABLE "TelegramUser" DROP COLUMN "creatorId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TelegramUser" ADD CONSTRAINT "TelegramUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
