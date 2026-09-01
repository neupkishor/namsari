-- Remove the obsolete property privacy flag.
ALTER TABLE "Property" DROP COLUMN IF EXISTS "isPrivate";
