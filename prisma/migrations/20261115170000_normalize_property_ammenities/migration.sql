-- Build a UUID master amenity table and preserve existing amenity name links.
CREATE TABLE "master_data__property_ammenities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(48) NOT NULL,
    "icon" VARCHAR(256) NOT NULL,
    CONSTRAINT "master_data__property_ammenities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "master_data__property_ammenities_name_key"
ON "master_data__property_ammenities"("name");

CREATE TEMP TABLE "_property_ammenity_uuid_map" (
    "legacy_id" INTEGER PRIMARY KEY,
    "new_id" UUID NOT NULL
);

INSERT INTO "master_data__property_ammenities" ("name", "icon")
SELECT DISTINCT LEFT("name", 48), '/icons/land-location.svg'
FROM "master_ammenities"
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "_property_ammenity_uuid_map" ("legacy_id", "new_id")
SELECT legacy."id", current."id"
FROM "master_ammenities" legacy
JOIN "master_data__property_ammenities" current
    ON current."name" = LEFT(legacy."name", 48);

-- The public property_id is now a UUID and becomes the referenced key for the joins.
ALTER TABLE "Property" DROP CONSTRAINT IF EXISTS "Property_propertyId_key";
DROP INDEX IF EXISTS "Property_propertyId_key";
ALTER TABLE "Property"
    ALTER COLUMN "propertyId" TYPE UUID
    USING CASE
        WHEN "propertyId" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            THEN "propertyId"::UUID
        ELSE gen_random_uuid()
    END;
UPDATE "Property" SET "propertyId" = gen_random_uuid() WHERE "propertyId" IS NULL;
ALTER TABLE "Property" ALTER COLUMN "propertyId" SET DEFAULT gen_random_uuid();
ALTER TABLE "Property" ALTER COLUMN "propertyId" SET NOT NULL;
ALTER TABLE "Property" RENAME COLUMN "propertyId" TO "property_id";
CREATE UNIQUE INDEX "Property_property_id_key" ON "Property"("property_id");

ALTER TABLE "property_ammenities"
    DROP CONSTRAINT IF EXISTS "property_ammenities_propertyId_fkey",
    DROP CONSTRAINT IF EXISTS "property_ammenities_ammenity_id_fkey";
ALTER TABLE "property_ammenities"
    ADD COLUMN "new_property_id" UUID,
    ADD COLUMN "new_ammenity_id" UUID;
UPDATE "property_ammenities" link
SET "new_property_id" = property."property_id",
    "new_ammenity_id" = amenity_map."new_id"
FROM "Property" property, "_property_ammenity_uuid_map" amenity_map
WHERE property."id" = link."propertyId"
  AND amenity_map."legacy_id" = link."ammenity_id";
ALTER TABLE "property_ammenities"
    ALTER COLUMN "id" TYPE UUID USING gen_random_uuid(),
    ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "property_ammenities"
    DROP COLUMN "propertyId",
    DROP COLUMN "ammenity_id",
    DROP COLUMN "status",
    DROP COLUMN "updatedAt";
ALTER TABLE "property_ammenities"
    RENAME COLUMN "new_property_id" TO "property_id";
ALTER TABLE "property_ammenities"
    RENAME COLUMN "new_ammenity_id" TO "ammenity_id";
ALTER TABLE "property_ammenities"
    ALTER COLUMN "property_id" SET NOT NULL,
    ALTER COLUMN "ammenity_id" SET NOT NULL;
ALTER TABLE "property_ammenities"
    ADD CONSTRAINT "property_ammenities_property_id_fkey"
        FOREIGN KEY ("property_id") REFERENCES "Property"("property_id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "property_ammenities_ammenity_id_fkey"
        FOREIGN KEY ("ammenity_id") REFERENCES "master_data__property_ammenities"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "property_ammenities_property_id_idx" ON "property_ammenities"("property_id");
DROP TABLE "master_ammenities";

-- Keep nearby location links attached through the same UUID property key.
ALTER TABLE "property_nearby_locations"
    DROP CONSTRAINT IF EXISTS "property_nearby_locations_property_id_fkey",
    ADD COLUMN "new_property_id" UUID;
UPDATE "property_nearby_locations" nearby
SET "new_property_id" = property."property_id"
FROM "Property" property
WHERE property."id" = nearby."property_id";
ALTER TABLE "property_nearby_locations"
    DROP COLUMN "property_id";
ALTER TABLE "property_nearby_locations"
    RENAME COLUMN "new_property_id" TO "property_id";
ALTER TABLE "property_nearby_locations"
    ALTER COLUMN "property_id" SET NOT NULL;
ALTER TABLE "property_nearby_locations"
    ADD CONSTRAINT "property_nearby_locations_property_id_fkey"
        FOREIGN KEY ("property_id") REFERENCES "Property"("property_id")
        ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "property_nearby_locations_property_id_idx"
ON "property_nearby_locations"("property_id");
