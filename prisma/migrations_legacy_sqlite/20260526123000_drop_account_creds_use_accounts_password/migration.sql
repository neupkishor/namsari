BEGIN;

-- Ensure every user has an accounts row for credentials auth
INSERT INTO "accounts" ("id", "type", "provider_account_id", "password_hash")
SELECT
  u."id"::text,
  CASE LOWER(COALESCE(u."type", 'user'))
    WHEN 'user' THEN 'user'::account_type
    WHEN 'agent' THEN 'agent'::account_type
    WHEN 'agency' THEN 'agency'::account_type
    WHEN 'admin' THEN 'admin'::account_type
    WHEN 'advertiser' THEN 'advertiser'::account_type
    WHEN 'bank' THEN 'bank'::account_type
    ELSE 'user'::account_type
  END,
  'user:' || u."id"::text,
  NULL
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "accounts" a WHERE a."id" = u."id"::text
);

-- Backfill password hash from account_creds when available
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'account_creds'
  ) THEN
    UPDATE "accounts" a
    SET "password_hash" = ac."password"
    FROM "account_creds" ac
    WHERE a."id" ~ '^[0-9]+$'
      AND ac."accountId" = a."id"::integer
      AND (a."password_hash" IS NULL OR a."password_hash" = '');

    DROP TABLE "account_creds";
  END IF;
END $$;

COMMIT;
