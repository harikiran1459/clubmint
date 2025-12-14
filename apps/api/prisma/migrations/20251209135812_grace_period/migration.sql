-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "kickAfter" TIMESTAMP(3),
ADD COLUMN     "warned24h" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "warnedExpired" BOOLEAN NOT NULL DEFAULT false;
