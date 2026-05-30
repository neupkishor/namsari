-- 1) Add enums for accounts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    CREATE TYPE "account_type" AS ENUM ('user', 'agent', 'agency', 'admin', 'advertiser', 'bank');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_provider') THEN
    CREATE TYPE "account_provider" AS ENUM ('bank', 'agency');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_role') THEN
    CREATE TYPE "account_role" AS ENUM ('user', 'agent', 'agency', 'admin', 'advertiser', 'bank');
  END IF;
END $$;

-- 2) Remove FK/user link from accounts and drop deprecated oauth fields
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_userId_fkey";
DROP INDEX IF EXISTS "accounts_provider_providerAccountId_key";

ALTER TABLE "accounts"
  DROP COLUMN IF EXISTS "userId",
  DROP COLUMN IF EXISTS "expires_at",
  DROP COLUMN IF EXISTS "token_type",
  DROP COLUMN IF EXISTS "scope",
  DROP COLUMN IF EXISTS "id_token",
  DROP COLUMN IF EXISTS "session_state";

-- 3) Rename provider account id and add new columns
ALTER TABLE "accounts"
  RENAME COLUMN "providerAccountId" TO "provider_account_id";

ALTER TABLE "accounts"
  ADD COLUMN IF NOT EXISTS "password_hash" TEXT,
  ADD COLUMN IF NOT EXISTS "role" "account_role" NOT NULL DEFAULT 'user';

-- 4) Cast type/provider to enums
ALTER TABLE "accounts"
  ALTER COLUMN "type" TYPE "account_type"
  USING LOWER("type")::"account_type";

ALTER TABLE "accounts"
  ALTER COLUMN "provider" DROP NOT NULL,
  ALTER COLUMN "provider" TYPE "account_provider"
  USING CASE
    WHEN "provider" IS NULL OR BTRIM("provider") = '' THEN NULL
    ELSE LOWER("provider")::"account_provider"
  END;

-- 5) Recreate provider/account unique key using new column
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key"
  ON "accounts"("provider", "provider_account_id");

-- 6) Convert account_creds from single latest password to password history log
DROP INDEX IF EXISTS "account_creds_accountId_key";
ALTER TABLE "account_creds" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS "account_creds_accountId_idx" ON "account_creds"("accountId");

-- 7) Seed accounts.password_hash from latest account_creds.password where possible
UPDATE "accounts" a
SET "password_hash" = ac."password"
FROM "account_creds" ac
WHERE a."id" ~ '^[0-9]+$'
  AND ac."accountId" = a."id"::integer
  AND a."password_hash" IS NULL;
