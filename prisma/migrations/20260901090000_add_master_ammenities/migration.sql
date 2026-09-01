CREATE TABLE "master_ammenities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "master_ammenities_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "property_ammenities" ADD COLUMN "ammenity_id" INTEGER NOT NULL;
ALTER TABLE "property_ammenities" DROP COLUMN "name";
ALTER TABLE "property_ammenities"
  ADD CONSTRAINT "property_ammenities_ammenity_id_fkey"
  FOREIGN KEY ("ammenity_id") REFERENCES "master_ammenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "property_ammenities_ammenity_id_idx" ON "property_ammenities"("ammenity_id");
