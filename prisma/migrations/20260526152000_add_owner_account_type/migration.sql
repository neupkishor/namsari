DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'account_type'
        AND e.enumlabel = 'owner'
    ) THEN
      ALTER TYPE "account_type" ADD VALUE 'owner';
    END IF;
  END IF;
END $$;
