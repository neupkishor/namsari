CREATE TYPE "PropertyPriceBasis" AS ENUM (
  'total',
  'perUnit',
  'perMonth',
  'perYear',
  'perUnitPerMonth',
  'perUnitPerYear'
);

ALTER TABLE "Property"
  ADD COLUMN "price_basis" "PropertyPriceBasis" NOT NULL DEFAULT 'total',
  ADD COLUMN "price_listed" DECIMAL(18,2),
  ADD COLUMN "price_negotiable" BOOLEAN NOT NULL DEFAULT false;
