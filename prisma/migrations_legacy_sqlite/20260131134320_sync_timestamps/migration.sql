/*
  Warnings:

  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

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
    "listed_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "listed_by" INTEGER NOT NULL,
    CONSTRAINT "Property_listed_by_fkey" FOREIGN KEY ("listed_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("author", "commercial_sub_category", "created_on", "id", "images", "likes", "listed_by", "location", "main_category", "price", "property_types", "purposes", "specs", "title") SELECT "author", "commercial_sub_category", "created_on", "id", "images", "likes", "listed_by", "location", "main_category", "price", "property_types", "purposes", "specs", "title" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_number" TEXT,
    "account_type" TEXT,
    "created_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("account_type", "contact_number", "id", "name", "username") SELECT "account_type", "contact_number", "id", "name", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
