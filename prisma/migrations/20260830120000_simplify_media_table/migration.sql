-- Keep existing upload rows while reducing Media to the required fields.
ALTER TABLE "Media" RENAME COLUMN "uploadType" TO "upload_for";
ALTER TABLE "Media" RENAME COLUMN "originalName" TO "original_name";
ALTER TABLE "Media" RENAME COLUMN "createdAt" TO "uploaded_at";

UPDATE "Media"
SET "path" = COALESCE("path", ''),
    "original_name" = COALESCE("original_name", 'unknown');

ALTER TABLE "Media" ALTER COLUMN "path" SET NOT NULL;

ALTER TABLE "Media" DROP COLUMN "url";
ALTER TABLE "Media" DROP COLUMN "fileName";
ALTER TABLE "Media" DROP COLUMN "mime";
ALTER TABLE "Media" DROP COLUMN "originalSize";
ALTER TABLE "Media" DROP COLUMN "compressedSize";
ALTER TABLE "Media" DROP COLUMN "storedSize";
ALTER TABLE "Media" DROP COLUMN "sha256";
ALTER TABLE "Media" DROP COLUMN "width";
ALTER TABLE "Media" DROP COLUMN "height";
ALTER TABLE "Media" DROP COLUMN "providerResponse";
ALTER TABLE "Media" DROP COLUMN "folderId";
ALTER TABLE "Media" DROP COLUMN "updatedAt";
DROP TABLE IF EXISTS "MediaFolder";

DROP INDEX IF EXISTS "Media_folderId_idx";
DROP INDEX IF EXISTS "Media_uploadType_idx";
DROP INDEX IF EXISTS "Media_createdAt_idx";
CREATE INDEX "Media_upload_for_idx" ON "Media"("upload_for");
CREATE INDEX "Media_uploaded_at_idx" ON "Media"("uploaded_at");
