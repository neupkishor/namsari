-- Add new JSON pricing columns to Property
ALTER TABLE "Property"
ADD COLUMN IF NOT EXISTS "price" JSONB,
ADD COLUMN IF NOT EXISTS "detailedPrice" JSONB;

-- Drop the legacy pricing table now that pricing lives on Property
DROP TABLE IF EXISTS "PropertyPricing" CASCADE;
