/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `CreatorEarning` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CreatorEarning_paymentId_key" ON "CreatorEarning"("paymentId");
