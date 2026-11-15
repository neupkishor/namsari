CREATE TABLE "master_data__nearby_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    CONSTRAINT "master_data__nearby_locations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "master_data__nearby_locations_name_key"
ON "master_data__nearby_locations"("name");

CREATE TABLE "property_nearby_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "location_id" UUID NOT NULL,
    "property_id" INTEGER NOT NULL,
    "distance" TEXT NOT NULL,
    CONSTRAINT "property_nearby_locations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_nearby_locations_location_id_fkey"
        FOREIGN KEY ("location_id") REFERENCES "master_data__nearby_locations"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "property_nearby_locations_property_id_fkey"
        FOREIGN KEY ("property_id") REFERENCES "Property"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "property_nearby_locations_property_id_idx"
ON "property_nearby_locations"("property_id");
CREATE INDEX "property_nearby_locations_location_id_idx"
ON "property_nearby_locations"("location_id");

-- Move any distances from the previous JSON storage into the normalized tables.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Property' AND column_name = 'nearby_distance'
    ) THEN
        INSERT INTO "master_data__nearby_locations" ("name", "icon")
        SELECT DISTINCT item->>'name', '/icons/land-location.svg'
        FROM "Property" p
        CROSS JOIN LATERAL jsonb_array_elements(p."nearby_distance") item
        WHERE item->>'name' IS NOT NULL
        ON CONFLICT ("name") DO NOTHING;

        INSERT INTO "property_nearby_locations" ("location_id", "property_id", "distance")
        SELECT master."id", p."id", item->>'distance'
        FROM "Property" p
        CROSS JOIN LATERAL jsonb_array_elements(p."nearby_distance") item
        JOIN "master_data__nearby_locations" master ON master."name" = item->>'name'
        WHERE item->>'distance' IS NOT NULL;

        ALTER TABLE "Property" DROP COLUMN "nearby_distance";
    END IF;
END $$;
