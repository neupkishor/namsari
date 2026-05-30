-- CreateTable
CREATE TABLE "FeaturedInformation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "property_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "featured_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured_till" DATETIME,
    CONSTRAINT "FeaturedInformation_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "price" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "main_category" TEXT NOT NULL,
    "commercial_sub_category" TEXT,
    "specs" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT NOT NULL,
    "property_types" TEXT NOT NULL,
    "purposes" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "google_maps_url" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listed_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "listed_by" INTEGER NOT NULL,
    CONSTRAINT "Property_listed_by_fkey" FOREIGN KEY ("listed_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("author", "commercial_sub_category", "created_on", "google_maps_url", "id", "images", "latitude", "likes", "listed_by", "listed_on", "location", "longitude", "main_category", "price", "property_types", "purposes", "slug", "specs", "title", "updated_at") SELECT "author", "commercial_sub_category", "created_on", "google_maps_url", "id", "images", "latitude", "likes", "listed_by", "listed_on", "location", "longitude", "main_category", "price", "property_types", "purposes", "slug", "specs", "title", "updated_at" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
