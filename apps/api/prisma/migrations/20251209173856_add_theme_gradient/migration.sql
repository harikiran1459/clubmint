/*
  Warnings:

  - You are about to drop the column `themeColor` on the `Page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Page" DROP COLUMN "themeColor",
ADD COLUMN     "themeColor1" TEXT,
ADD COLUMN     "themeColor2" TEXT;
