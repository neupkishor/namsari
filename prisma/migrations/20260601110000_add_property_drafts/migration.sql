-- CreateTable
CREATE TABLE "property_drafts" (
    "id" SERIAL NOT NULL,
    "changes" JSONB NOT NULL,
    "doing" TEXT NOT NULL DEFAULT 'creation',
    "created_by" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_drafts_account_id_status_idx" ON "property_drafts"("account_id", "status");

-- CreateIndex
CREATE INDEX "property_drafts_created_by_idx" ON "property_drafts"("created_by");

-- AddForeignKey
ALTER TABLE "property_drafts" ADD CONSTRAINT "property_drafts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_drafts" ADD CONSTRAINT "property_drafts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;