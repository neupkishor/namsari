/*
  Warnings:

  - You are about to drop the column `propertyPurpose` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `propertyType` on the `Property` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PropertyType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PropertyPurpose" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PropertyNature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PropertyToPropertyType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PropertyToPropertyType_A_fkey" FOREIGN KEY ("A") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PropertyToPropertyType_B_fkey" FOREIGN KEY ("B") REFERENCES "PropertyType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PropertyToPropertyPurpose" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PropertyToPropertyPurpose_A_fkey" FOREIGN KEY ("A") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PropertyToPropertyPurpose_B_fkey" FOREIGN KEY ("B") REFERENCES "PropertyPurpose" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PropertyToPropertyNature" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PropertyToPropertyNature_A_fkey" FOREIGN KEY ("A") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PropertyToPropertyNature_B_fkey" FOREIGN KEY ("B") REFERENCES "PropertyNature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "soldStatus" TEXT NOT NULL DEFAULT 'unsold',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "roadType" TEXT,
    "roadSize" TEXT,
    "facingDirection" TEXT,
    "listedById" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "authorizedPersonId" INTEGER,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "created_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Property_listedById_fkey" FOREIGN KEY ("listedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Property_authorizedPersonId_fkey" FOREIGN KEY ("authorizedPersonId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("authorizedPersonId", "created_on", "facingDirection", "id", "isExclusive", "isFeatured", "isPrivate", "isVerified", "listedById", "ownerId", "propertyId", "remarks", "roadSize", "roadType", "slug", "soldStatus", "status", "title", "updated_at") SELECT "authorizedPersonId", "created_on", "facingDirection", "id", "isExclusive", "isFeatured", "isPrivate", "isVerified", "listedById", "ownerId", "propertyId", "remarks", "roadSize", "roadType", "slug", "soldStatus", "status", "title", "updated_at" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_propertyId_key" ON "Property"("propertyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PropertyType_name_key" ON "PropertyType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyPurpose_name_key" ON "PropertyPurpose"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyNature_name_key" ON "PropertyNature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyToPropertyType_AB_unique" ON "_PropertyToPropertyType"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyToPropertyType_B_index" ON "_PropertyToPropertyType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyToPropertyPurpose_AB_unique" ON "_PropertyToPropertyPurpose"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyToPropertyPurpose_B_index" ON "_PropertyToPropertyPurpose"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyToPropertyNature_AB_unique" ON "_PropertyToPropertyNature"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyToPropertyNature_B_index" ON "_PropertyToPropertyNature"("B");
