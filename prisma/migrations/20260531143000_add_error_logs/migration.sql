CREATE TABLE "errors" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "page" TEXT,
    "stack" TEXT,
    "log" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "errors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "errors_occurred_at_idx" ON "errors"("occurred_at");
CREATE INDEX "errors_source_idx" ON "errors"("source");
CREATE INDEX "errors_userId_idx" ON "errors"("userId");

ALTER TABLE "errors" ADD CONSTRAINT "errors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
