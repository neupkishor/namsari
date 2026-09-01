-- Change roadSize from text to a numeric road-width value.
ALTER TABLE "Property"
ALTER COLUMN "roadSize" TYPE DECIMAL(15, 10)
USING CASE
  WHEN trim("roadSize") ~ '^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)$'
    THEN trim("roadSize")::DECIMAL(15, 10)
  ELSE NULL
END;
