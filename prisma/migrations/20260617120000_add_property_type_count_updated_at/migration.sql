ALTER TABLE "PropertyType"
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

WITH counts AS (
    SELECT
        pt.id,
        COUNT(p.id)::integer AS count
    FROM "PropertyType" pt
    LEFT JOIN "_PropertyToPropertyType" ppt ON ppt."B" = pt.id
    LEFT JOIN "Property" p ON p.id = ppt."A" AND p.status = 'approved'
    GROUP BY pt.id
)
UPDATE "PropertyType" pt
SET
    "propertyCount" = counts.count,
    "updated_at" = CURRENT_TIMESTAMP
FROM counts
WHERE pt.id = counts.id;
