-- Rename sale to sell while retaining the existing PostgreSQL enum type.
ALTER TYPE "PropertyPurpose" RENAME VALUE 'sale' TO 'sell';

-- Keep the first existing purpose; legacy sale + rent listings resolve to sell.
ALTER TABLE "Property"
ADD COLUMN "purpose_new" "PropertyPurpose";

UPDATE "Property"
SET "purpose_new" = CASE
    WHEN 'sell' = ANY("purposes") THEN 'sell'::"PropertyPurpose"
    WHEN 'rent' = ANY("purposes") THEN 'rent'::"PropertyPurpose"
    ELSE 'sell'::"PropertyPurpose"
END;

ALTER TABLE "Property"
ALTER COLUMN "purpose_new" SET NOT NULL;

ALTER TABLE "Property"
DROP COLUMN "purposes";

ALTER TABLE "Property"
RENAME COLUMN "purpose_new" TO "purpose";
