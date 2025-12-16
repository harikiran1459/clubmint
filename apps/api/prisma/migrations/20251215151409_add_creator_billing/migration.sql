/*
  Warnings:

  - The values [FREE,PRO,BUSINESS] on the enum `CreatorPlan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CreatorPlan_new" AS ENUM ('free', 'starter', 'pro');
ALTER TABLE "Creator" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Creator" ALTER COLUMN "plan" TYPE "CreatorPlan_new" USING ("plan"::text::"CreatorPlan_new");
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "CreatorPlan_new" USING ("plan"::text::"CreatorPlan_new");
ALTER TYPE "CreatorPlan" RENAME TO "CreatorPlan_old";
ALTER TYPE "CreatorPlan_new" RENAME TO "CreatorPlan";
DROP TYPE "CreatorPlan_old";
ALTER TABLE "Creator" ALTER COLUMN "plan" SET DEFAULT 'free';
COMMIT;

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "commissionPct" DOUBLE PRECISION NOT NULL DEFAULT 15,
ADD COLUMN     "razorpaySubId" TEXT,
ALTER COLUMN "plan" SET DEFAULT 'free';
