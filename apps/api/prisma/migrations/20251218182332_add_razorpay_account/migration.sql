-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "razorpayAccountId" TEXT;
