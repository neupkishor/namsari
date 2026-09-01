-- Replace JSON property media with a dedicated relation table.
CREATE TABLE "PropertyMedia" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "resourceUrl" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    CONSTRAINT "PropertyMedia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PropertyMedia_propertyId_idx" ON "PropertyMedia"("propertyId");
ALTER TABLE "PropertyMedia" ADD CONSTRAINT "PropertyMedia_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Property" DROP COLUMN IF EXISTS "media";
