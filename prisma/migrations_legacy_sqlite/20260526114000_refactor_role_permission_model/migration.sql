BEGIN;

-- Remove old user-role FK before replacing role table
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_roleId_fkey";

-- Drop membership table as requested
DROP TABLE IF EXISTS "Member" CASCADE;

-- Keep legacy copies for data migration
ALTER TABLE "Role" RENAME TO "Role_legacy";
ALTER TABLE "RolePermission" RENAME TO "RolePermission_legacy";

-- New role table: id, role, description, permissions(jsonb)
CREATE TABLE "Role" (
  "id" INTEGER PRIMARY KEY,
  "role" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "permissions" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Role" ("id", "role", "description", "permissions", "created_at", "updated_at")
SELECT
  r."id",
  r."name" AS "role",
  r."description",
  COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'resource', rp."resource",
        'action', rp."action"
      )
    ) FILTER (WHERE rp."id" IS NOT NULL),
    '[]'::jsonb
  ) AS "permissions",
  r."created_at",
  r."updated_at"
FROM "Role_legacy" r
LEFT JOIN "RolePermission_legacy" rp ON rp."roleId" = r."id"
GROUP BY r."id", r."name", r."description", r."created_at", r."updated_at";

SELECT setval(pg_get_serial_sequence('"Role"', 'id'), COALESCE((SELECT MAX("id") FROM "Role"), 1), true);

-- Keep RolePermission table but transform it into permission catalog
CREATE TABLE "RolePermission" (
  "id" SERIAL PRIMARY KEY,
  "resource" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  CONSTRAINT "RolePermission_resource_action_key" UNIQUE ("resource", "action")
);

INSERT INTO "RolePermission" ("resource", "action")
SELECT DISTINCT "resource", "action"
FROM "RolePermission_legacy";

-- Role to permission mapping table
CREATE TABLE "role_permission_map" (
  "id" SERIAL PRIMARY KEY,
  "role_id" INTEGER NOT NULL,
  "permission_id" INTEGER NOT NULL,
  CONSTRAINT "role_permission_map_role_id_permission_id_key" UNIQUE ("role_id", "permission_id"),
  CONSTRAINT "role_permission_map_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "role_permission_map_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "RolePermission"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "role_permission_map" ("role_id", "permission_id")
SELECT DISTINCT rl."id", rp_new."id"
FROM "Role_legacy" rl
JOIN "RolePermission_legacy" rpl ON rpl."roleId" = rl."id"
JOIN "RolePermission" rp_new ON rp_new."resource" = rpl."resource" AND rp_new."action" = rpl."action";

-- Reconnect users.roleId to new Role table
ALTER TABLE "users"
  ADD CONSTRAINT "users_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- accounts.role should reference RolePermission.id
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_role_fkey";
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "role";
ALTER TABLE "accounts" ADD COLUMN "role" INTEGER;
ALTER TABLE "accounts"
  ADD CONSTRAINT "accounts_role_fkey"
  FOREIGN KEY ("role") REFERENCES "RolePermission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "accounts_role_idx" ON "accounts"("role");
CREATE INDEX IF NOT EXISTS "role_permission_map_role_id_idx" ON "role_permission_map"("role_id");
CREATE INDEX IF NOT EXISTS "role_permission_map_permission_id_idx" ON "role_permission_map"("permission_id");

-- Cleanup legacy tables and old enum
DROP TABLE "RolePermission_legacy";
DROP TABLE "Role_legacy";
DROP TYPE IF EXISTS "account_role";

COMMIT;
