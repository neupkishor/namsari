CREATE TYPE "RoadType" AS ENUM (
  'blacktopped',
  'concrete',
  'paved_block',
  'gravel_murrum',
  'earth_dirt',
  'stone_paved',
  'brick_paved',
  'unknown'
);

ALTER TABLE "Property"
ALTER COLUMN "roadType" TYPE "RoadType"
USING CASE
  WHEN "roadType" IN (
    'blacktopped',
    'concrete',
    'paved_block',
    'gravel_murrum',
    'earth_dirt',
    'stone_paved',
    'brick_paved'
  ) THEN "roadType"::"RoadType"
  ELSE NULL
END;
