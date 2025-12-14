-- CreateTable
CREATE TABLE "_PageProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PageProducts_AB_unique" ON "_PageProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_PageProducts_B_index" ON "_PageProducts"("B");

-- AddForeignKey
ALTER TABLE "_PageProducts" ADD CONSTRAINT "_PageProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "CreatorPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageProducts" ADD CONSTRAINT "_PageProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
