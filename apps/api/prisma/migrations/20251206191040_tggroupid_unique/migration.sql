/*
  Warnings:

  - A unique constraint covering the columns `[tgGroupId]` on the table `TelegramGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TelegramGroup_tgGroupId_key" ON "TelegramGroup"("tgGroupId");
