-- Change roadSize from text to a numeric road-width value.
ALTER TABLE "Property"
ALTER COLUMN "roadSize" TYPE DECIMAL(15, 10)
USING NULLIF(trim("roadSize"), '')::DECIMAL(15, 10);
