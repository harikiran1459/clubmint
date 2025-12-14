-- CreateTable
CREATE TABLE "_ProductGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductGroups_AB_unique" ON "_ProductGroups"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductGroups_B_index" ON "_ProductGroups"("B");

-- AddForeignKey
ALTER TABLE "_ProductGroups" ADD CONSTRAINT "_ProductGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductGroups" ADD CONSTRAINT "_ProductGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "TelegramGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
