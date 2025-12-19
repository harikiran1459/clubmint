/*
  Warnings:

  - You are about to drop the column `amountPaise` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `commissionPaise` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `creatorPaise` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commission` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorAmount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amountPaise",
DROP COLUMN "commissionPaise",
DROP COLUMN "creatorPaise",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "commission" INTEGER NOT NULL,
ADD COLUMN     "creatorAmount" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "razorpayPaymentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
