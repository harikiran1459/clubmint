/*
  Warnings:

  - Added the required column `provider` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CreatorPlan" AS ENUM ('FREE', 'PRO', 'BUSINESS');

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "plan" "CreatorPlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "planStartedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "plan" "CreatorPlan",
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "providerCustomerId" TEXT,
ADD COLUMN     "providerSubscriptionId" TEXT;
