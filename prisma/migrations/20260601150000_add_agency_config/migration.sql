-- CreateTable
CREATE TABLE "agency_config" (
    "id" SERIAL NOT NULL,
    "agency_id" INTEGER NOT NULL,
    "compulsory_fields" JSONB,
    "def_units" JSONB,
    "review_required" BOOLEAN,
    "default_location" JSONB,
    "min_photo_count" INTEGER,
    "can_agent_change_info" BOOLEAN,
    "can_agent_delete" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agency_config_agency_id_key" ON "agency_config"("agency_id");

-- AddForeignKey
ALTER TABLE "agency_config" ADD CONSTRAINT "agency_config_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;