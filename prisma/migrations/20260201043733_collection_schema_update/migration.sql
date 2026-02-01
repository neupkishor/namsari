/*
  Warnings:

  - You are about to drop the `_CollectionToProperty` table. If the table is not empty, all the data it contains will be lost.
  - The required column `slug` was added to the `Collection` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "_CollectionToProperty_B_index";

-- DropIndex
DROP INDEX "_CollectionToProperty_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CollectionToProperty";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CollectionProperty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collection_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectionProperty_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionProperty_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'user_generated',
    "moreInfo" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("created_at", "description", "id", "is_public", "name", "updated_at", "user_id") SELECT "created_at", "description", "id", "is_public", "name", "updated_at", "user_id" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CollectionProperty_collection_id_property_id_key" ON "CollectionProperty"("collection_id", "property_id");
