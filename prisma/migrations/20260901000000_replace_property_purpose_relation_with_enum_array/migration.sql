-- The old lookup table also owns a PostgreSQL row type named PropertyPurpose.
-- Rename that table first so the enum can safely use the same database name.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relnamespace = 'public'::regnamespace
      AND relname = 'PropertyPurpose'
      AND relkind = 'r'
  ) THEN
    ALTER TABLE "PropertyPurpose" RENAME TO "PropertyPurpose_legacy";
  END IF;
END
$$;

-- Create the enum used by Property.purposes when it does not already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
      AND typname = 'PropertyPurpose'
      AND typtype = 'e'
  ) THEN
    CREATE TYPE "PropertyPurpose" AS ENUM ('sale', 'rent');
  END IF;
END
$$;

-- Add the replacement enum-array column while retaining the old relation data.
ALTER TABLE "Property"
ADD COLUMN "purposes_new" "PropertyPurpose"[] NOT NULL DEFAULT ARRAY[]::"PropertyPurpose"[];

-- Convert the existing PropertyPurpose join records into enum arrays.
UPDATE "Property" AS p
SET "purposes_new" = purpose_values.purposes
FROM (
  SELECT
    ppt."A" AS property_id,
    ARRAY_AGG(pp."name"::"PropertyPurpose" ORDER BY pp."id") AS purposes
  FROM "_PropertyToPropertyPurpose" AS ppt
  INNER JOIN "PropertyPurpose_legacy" AS pp ON pp."id" = ppt."B"
  GROUP BY ppt."A"
) AS purpose_values
WHERE p."id" = purpose_values.property_id;

-- Remove the old many-to-many relation and lookup table.
DROP TABLE "_PropertyToPropertyPurpose";
DROP TABLE "PropertyPurpose_legacy";

-- Replace the temporary column with the final field name.
ALTER TABLE "Property" RENAME COLUMN "purposes_new" TO "purposes";
