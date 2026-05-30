-- Add per-ad-type visibility toggles to SystemSettings
ALTER TABLE "SystemSettings" ADD COLUMN "show_hero_carousel_ad" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SystemSettings" ADD COLUMN "show_feed_ad" BOOLEAN NOT NULL DEFAULT true;
