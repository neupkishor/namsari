ALTER TABLE "PropertyLocation"
ADD COLUMN "province" TEXT NOT NULL DEFAULT '';

ALTER TABLE "PropertyLocation"
ALTER COLUMN "province" DROP DEFAULT;
