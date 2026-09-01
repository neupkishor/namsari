-- Create the enum used by Property.purposes.
CREATE TYPE "PropertyPurpose" AS ENUM ('sale', 'rent');

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
  INNER JOIN "PropertyPurpose" AS pp ON pp."id" = ppt."B"
  GROUP BY ppt."A"
) AS purpose_values
WHERE p."id" = purpose_values.property_id;

-- Remove the old many-to-many relation and lookup table.
DROP TABLE "_PropertyToPropertyPurpose";
DROP TABLE "PropertyPurpose";

-- Replace the temporary column with the final field name.
ALTER TABLE "Property" RENAME COLUMN "purposes_new" TO "purposes";
