/*
  Warnings:

  - You are about to alter the column `price` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
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
    "created_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listed_by" INTEGER NOT NULL,
    CONSTRAINT "Property_listed_by_fkey" FOREIGN KEY ("listed_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("author", "commercial_sub_category", "created_on", "id", "images", "likes", "listed_by", "location", "main_category", "price", "property_types", "purposes", "specs", "title") SELECT "author", "commercial_sub_category", "created_on", "id", "images", "likes", "listed_by", "location", "main_category", "price", "property_types", "purposes", "specs", "title" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
