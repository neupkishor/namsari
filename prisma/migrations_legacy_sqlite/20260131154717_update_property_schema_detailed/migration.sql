/*
  Warnings:

  - You are about to drop the column `author` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `commercial_sub_category` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `google_maps_url` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `is_featured` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `listed_by` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `listed_on` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `main_category` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `property_types` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `purposes` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `specs` on the `Property` table. All the data in the column will be lost.
  - Added the required column `listedById` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyPurpose` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyType` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "bio" TEXT;

-- CreateTable
CREATE TABLE "KYC" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropertyLocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" INTEGER NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "country" TEXT NOT NULL DEFAULT 'Nepal',
    "district" TEXT NOT NULL,
    "cityVillage" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "ward" TEXT,
    "landmark" TEXT,
    "distanceFrom" TEXT,
    CONSTRAINT "PropertyLocation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropertyAmenity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "distance" TEXT,
    CONSTRAINT "PropertyAmenity_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropertyPricing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" INTEGER NOT NULL,
    "negotiable" BOOLEAN NOT NULL DEFAULT true,
    "pricingType" TEXT NOT NULL,
    "unit" TEXT,
    "price" REAL NOT NULL,
    "priceInWords" TEXT,
    "priceNegotiable" REAL,
    "priceNegotiableInWords" TEXT,
    "rentPrice" REAL,
    CONSTRAINT "PropertyPricing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropertyOpenHouse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" INTEGER NOT NULL,
    "markOpenHouse" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME,
    "startTime" TEXT,
    "endTime" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    CONSTRAINT "PropertyOpenHouse_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "imageOf" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropertyVideo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "PropertyVideo_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" TEXT,
    "propertyType" TEXT NOT NULL,
    "propertyPurpose" TEXT NOT NULL,
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
INSERT INTO "new_Property" ("created_on", "id", "slug", "title", "updated_at") SELECT "created_on", "id", "slug", "title", "updated_at" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_propertyId_key" ON "Property"("propertyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "KYC_userId_key" ON "KYC"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyLocation_propertyId_key" ON "PropertyLocation"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyPricing_propertyId_key" ON "PropertyPricing"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyOpenHouse_propertyId_key" ON "PropertyOpenHouse"("propertyId");
