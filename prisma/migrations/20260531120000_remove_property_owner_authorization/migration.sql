ALTER TABLE "Property" DROP CONSTRAINT IF EXISTS "Property_authorizedPersonId_fkey";
ALTER TABLE "Property" DROP CONSTRAINT IF EXISTS "Property_ownerId_fkey";

ALTER TABLE "Property" DROP COLUMN IF EXISTS "authorizedPersonId";
ALTER TABLE "Property" DROP COLUMN IF EXISTS "ownerId";
