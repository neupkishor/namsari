-- Convert property areas to square meters and road widths to meters before
-- removing the per-row area unit column. Legacy missing area units are treated
-- as aana, and road widths are treated as feet.

UPDATE "PropertyFeatures"
SET "builtUpArea" = ROUND(
    "builtUpArea"::numeric * CASE LOWER(COALESCE(NULLIF(TRIM("builtUpAreaUnit"), ''), 'aana'))
        WHEN 'sqm' THEN 1
        WHEN 'sq.m' THEN 1
        WHEN 'sq m' THEN 1
        WHEN 'square meter' THEN 1
        WHEN 'square meters' THEN 1
        WHEN 'm2' THEN 1
        WHEN 'm²' THEN 1
        WHEN 'sqft' THEN 0.09290304
        WHEN 'sq.ft' THEN 0.09290304
        WHEN 'sq.ft.' THEN 0.09290304
        WHEN 'sq ft' THEN 0.09290304
        WHEN 'ft2' THEN 0.09290304
        WHEN 'square feet' THEN 0.09290304
        WHEN 'aana' THEN 31.79606544
        WHEN 'kattha' THEN 338.6315808
        WHEN 'katta' THEN 338.6315808
        WHEN 'katha' THEN 338.6315808
        WHEN 'dhur' THEN 16.93157904
        WHEN 'dhoor' THEN 16.93157904
        WHEN 'ropani' THEN 508.73704704
        ELSE 31.79606544
    END,
    10
)
WHERE "builtUpArea" IS NOT NULL;

ALTER TABLE "PropertyFeatures"
    ALTER COLUMN "builtUpArea" TYPE DECIMAL(18, 10)
        USING "builtUpArea"::numeric(18, 10),
    DROP COLUMN "builtUpAreaUnit";

UPDATE "Property"
SET "roadSize" = ROUND("roadSize"::numeric * 0.3048, 10)
WHERE "roadSize" IS NOT NULL;

ALTER TABLE "Property"
    ALTER COLUMN "roadSize" TYPE DECIMAL(18, 10)
        USING "roadSize"::numeric(18, 10);

UPDATE "property_details_land"
SET "landArea" = ROUND("landArea" * 31.79606544, 10)
WHERE "landArea" IS NOT NULL;

UPDATE "property_details_house"
SET "builtUpArea" = ROUND("builtUpArea" * 31.79606544, 10)
WHERE "builtUpArea" IS NOT NULL;

UPDATE "property_details_apartment"
SET "builtUpArea" = ROUND("builtUpArea" * 31.79606544, 10)
WHERE "builtUpArea" IS NOT NULL;

UPDATE "property_details_space"
SET "totalArea" = ROUND("totalArea" * 31.79606544, 10)
WHERE "totalArea" IS NOT NULL;
