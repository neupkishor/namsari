-- Add section visibility toggles to SystemSettings
ALTER TABLE "SystemSettings" ADD COLUMN "show_featured_properties" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN "show_sponsored_deals" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN "show_property_collection" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN "show_explore_categories" BOOLEAN NOT NULL DEFAULT true;
