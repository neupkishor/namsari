CREATE TABLE "PropertySaleStatus" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "updatedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertySaleStatus_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PropertySaleStatus_propertyId_idx" ON "PropertySaleStatus"("propertyId");

ALTER TABLE "PropertySaleStatus"
  ADD CONSTRAINT "PropertySaleStatus_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Property" DROP COLUMN IF EXISTS "soldStatus";
