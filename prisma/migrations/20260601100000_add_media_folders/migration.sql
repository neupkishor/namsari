CREATE TABLE "MediaFolder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullPath" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaFolder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaFolder_fullPath_key" ON "MediaFolder"("fullPath");
CREATE UNIQUE INDEX "MediaFolder_parentId_slug_key" ON "MediaFolder"("parentId", "slug");
CREATE INDEX "MediaFolder_parentId_idx" ON "MediaFolder"("parentId");
CREATE INDEX "MediaFolder_createdById_idx" ON "MediaFolder"("createdById");

ALTER TABLE "MediaFolder" ADD CONSTRAINT "MediaFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MediaFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaFolder" ADD CONSTRAINT "MediaFolder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Media" ADD COLUMN "folderId" INTEGER;
CREATE INDEX "Media_folderId_idx" ON "Media"("folderId");
ALTER TABLE "Media" ADD CONSTRAINT "Media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "MediaFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
