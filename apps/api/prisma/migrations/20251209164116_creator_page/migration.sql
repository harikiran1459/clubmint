-- CreateTable
CREATE TABLE "CreatorPage" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "heroImage" TEXT,
    "heroVideo" TEXT,
    "settings" JSONB,
    "sections" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagePreview" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "previewJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagePreview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPage_slug_key" ON "CreatorPage"("slug");

-- AddForeignKey
ALTER TABLE "CreatorPage" ADD CONSTRAINT "CreatorPage_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagePreview" ADD CONSTRAINT "PagePreview_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "CreatorPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
