/*
  Warnings:

  - A unique constraint covering the columns `[creatorId,slug]` on the table `CreatorPage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CreatorPage_creatorId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPage_creatorId_slug_key" ON "CreatorPage"("creatorId", "slug");
