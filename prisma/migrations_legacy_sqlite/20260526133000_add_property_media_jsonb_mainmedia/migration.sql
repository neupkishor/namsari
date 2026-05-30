BEGIN;

ALTER TABLE "Property"
  ADD COLUMN IF NOT EXISTS "media" JSONB,
  ADD COLUMN IF NOT EXISTS "mainMedia" TEXT;

-- Backfill media from PropertyImage and PropertyVideo tables
WITH image_rows AS (
  SELECT
    pi."propertyId" AS property_id,
    jsonb_agg(
      jsonb_build_object(
        'kind', 'image',
        'url', pi."url",
        'label', pi."imageOf",
        'filename', pi."filename",
        'sort', pi."id"
      )
      ORDER BY pi."id"
    ) AS images,
    MIN(pi."id") AS first_image_id
  FROM "PropertyImage" pi
  GROUP BY pi."propertyId"
),
video_rows AS (
  SELECT
    pv."propertyId" AS property_id,
    jsonb_agg(
      jsonb_build_object(
        'kind', 'video',
        'url', pv."url",
        'label', pv."type",
        'sort', pv."id"
      )
      ORDER BY pv."id"
    ) AS videos
  FROM "PropertyVideo" pv
  GROUP BY pv."propertyId"
),
first_images AS (
  SELECT DISTINCT ON (pi."propertyId")
    pi."propertyId" AS property_id,
    pi."url" AS main_image_url
  FROM "PropertyImage" pi
  ORDER BY pi."propertyId", pi."id" ASC
)
UPDATE "Property" p
SET
  "media" = jsonb_strip_nulls(
    jsonb_build_object(
      'images', COALESCE(ir.images, '[]'::jsonb),
      'videos', COALESCE(vr.videos, '[]'::jsonb)
    )
  ),
  "mainMedia" = COALESCE(fi.main_image_url, p."mainMedia")
FROM image_rows ir
FULL OUTER JOIN video_rows vr
  ON ir.property_id = vr.property_id
LEFT JOIN first_images fi
  ON fi.property_id = COALESCE(ir.property_id, vr.property_id)
WHERE p."id" = COALESCE(ir.property_id, vr.property_id)
  AND (p."media" IS NULL OR p."mainMedia" IS NULL);

COMMIT;
