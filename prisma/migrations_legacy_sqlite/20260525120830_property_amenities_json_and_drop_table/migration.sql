ALTER TABLE "Property"
ADD COLUMN IF NOT EXISTS "amenities" JSONB;

UPDATE "Property" p
SET "amenities" = agg.amenities_json
FROM (
  SELECT
    "propertyId",
    jsonb_agg(
      jsonb_build_object(
        'type', "type",
        'name', "name",
        'distance', "distance"
      )
      ORDER BY id
    ) AS amenities_json
  FROM "PropertyAmenity"
  GROUP BY "propertyId"
) agg
WHERE p.id = agg."propertyId"
  AND p."amenities" IS NULL;

DROP TABLE IF EXISTS "PropertyAmenity";
