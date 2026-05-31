CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "uploaderId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT,
    "uploadType" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mime" TEXT,
    "originalSize" INTEGER,
    "compressedSize" INTEGER,
    "storedSize" INTEGER,
    "sha256" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "providerResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Media_uploaderId_idx" ON "Media"("uploaderId");
CREATE INDEX "Media_uploadType_idx" ON "Media"("uploadType");
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

ALTER TABLE "Media" ADD CONSTRAINT "Media_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
