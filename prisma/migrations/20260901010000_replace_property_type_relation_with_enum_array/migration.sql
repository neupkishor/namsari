-- The old lookup table owns a PostgreSQL row type named PropertyType.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class
    WHERE relnamespace = 'public'::regnamespace
      AND relname = 'PropertyType'
      AND relkind = 'r'
  ) THEN
    ALTER TABLE "PropertyType" RENAME TO "PropertyType_legacy";
  END IF;
END
$$;

CREATE TYPE "PropertyType" AS ENUM (
  'house', 'bungalow', 'land', 'apartment',
  'commercial_space', 'villa', 'penthouse'
);

ALTER TABLE "Property"
ADD COLUMN "types_new" "PropertyType"[] NOT NULL DEFAULT ARRAY[]::"PropertyType"[];

UPDATE "Property" AS p
SET "types_new" = type_values.types
FROM (
  SELECT ptt."A" AS property_id,
    ARRAY_AGG(CASE pp."name"
      WHEN 'commercial space' THEN 'commercial_space'::"PropertyType"
      ELSE pp."name"::"PropertyType"
    END ORDER BY pp."id") AS types
  FROM "_PropertyToPropertyType" AS ptt
  INNER JOIN "PropertyType_legacy" AS pp ON pp."id" = ptt."B"
  GROUP BY ptt."A"
) AS type_values
WHERE p."id" = type_values.property_id;

DROP TABLE "_PropertyToPropertyType";
DROP TABLE "PropertyType_legacy";
ALTER TABLE "Property" RENAME COLUMN "types_new" TO "types";
