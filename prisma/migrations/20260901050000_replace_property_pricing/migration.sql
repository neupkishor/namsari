-- Replace JSON pricing fields with relational property prices.
CREATE TABLE "PropertyPrice" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "base" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "negotiable" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PropertyPrice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PropertyPrice_propertyId_idx" ON "PropertyPrice"("propertyId");
CREATE INDEX "PropertyPrice_propertyId_isDefault_idx" ON "PropertyPrice"("propertyId", "isDefault");
ALTER TABLE "PropertyPrice" ADD CONSTRAINT "PropertyPrice_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Property" DROP COLUMN IF EXISTS "price";
ALTER TABLE "Property" DROP COLUMN IF EXISTS "detailedPrice";
