CREATE TABLE "property_ammenities" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" VARCHAR(24) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "property_ammenities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "property_ammenities_propertyId_idx" ON "property_ammenities"("propertyId");

ALTER TABLE "property_ammenities"
  ADD CONSTRAINT "property_ammenities_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Property" DROP COLUMN IF EXISTS "amenities";
