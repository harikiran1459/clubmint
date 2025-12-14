/*
  Warnings:

  - A unique constraint covering the columns `[creatorId]` on the table `CreatorPage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CreatorPage_creatorId_key" ON "CreatorPage"("creatorId");
