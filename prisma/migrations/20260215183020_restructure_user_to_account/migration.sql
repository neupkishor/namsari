/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_username_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "contact_number" TEXT,
    "type" TEXT NOT NULL DEFAULT 'user',
    "bio" TEXT,
    "profile_picture" TEXT,
    "cover_image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "moreInfo" TEXT,
    "created_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "agency_id" INTEGER,
    "roleId" INTEGER,
    CONSTRAINT "users_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account_creds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "account_creds_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "permissions" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "permissions_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "permissions_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "view_mode" TEXT NOT NULL DEFAULT 'classic',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("created_at", "description", "id", "is_public", "moreInfo", "name", "slug", "type", "updated_at", "user_id", "view_mode") SELECT "created_at", "description", "id", "is_public", "moreInfo", "name", "slug", "type", "updated_at", "user_id", "view_mode" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "property_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Comment_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("content", "created_at", "id", "property_id", "user_id") SELECT "content", "created_at", "id", "property_id", "user_id" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE TABLE "new_KYC" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_KYC" ("created_at", "email", "id", "name", "phone", "updated_at", "userId") SELECT "created_at", "email", "id", "name", "phone", "updated_at", "userId" FROM "KYC";
DROP TABLE "KYC";
ALTER TABLE "new_KYC" RENAME TO "KYC";
CREATE UNIQUE INDEX "KYC_userId_key" ON "KYC"("userId");
CREATE TABLE "new_Like" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "property_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Like_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Like" ("created_at", "id", "property_id", "user_id") SELECT "created_at", "id", "property_id", "user_id" FROM "Like";
DROP TABLE "Like";
ALTER TABLE "new_Like" RENAME TO "Like";
CREATE UNIQUE INDEX "Like_property_id_user_id_key" ON "Like"("property_id", "user_id");
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
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Property_listedById_fkey" FOREIGN KEY ("listedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Property_authorizedPersonId_fkey" FOREIGN KEY ("authorizedPersonId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("authorizedPersonId", "created_on", "facingDirection", "id", "isExclusive", "isFeatured", "isPrivate", "isVerified", "listedById", "ownerId", "propertyId", "remarks", "roadSize", "roadType", "shares", "slug", "soldStatus", "status", "title", "updated_at", "views") SELECT "authorizedPersonId", "created_on", "facingDirection", "id", "isExclusive", "isFeatured", "isPrivate", "isVerified", "listedById", "ownerId", "propertyId", "remarks", "roadSize", "roadType", "shares", "slug", "soldStatus", "status", "title", "updated_at", "views" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_propertyId_key" ON "Property"("propertyId");
CREATE TABLE "new_Requirement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "mode" TEXT NOT NULL DEFAULT 'simple',
    "content" TEXT,
    "propertyTypes" TEXT,
    "purposes" TEXT,
    "natures" TEXT,
    "facings" TEXT,
    "district" TEXT,
    "cityVillage" TEXT,
    "area" TEXT,
    "roadAccess" TEXT,
    "minPrice" REAL,
    "maxPrice" REAL,
    "pricingUnit" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Requirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Requirement" ("area", "cityVillage", "content", "created_at", "district", "facings", "id", "latitude", "longitude", "maxPrice", "minPrice", "mode", "natures", "pricingUnit", "propertyTypes", "purposes", "remarks", "roadAccess", "status", "updated_at", "userId") SELECT "area", "cityVillage", "content", "created_at", "district", "facings", "id", "latitude", "longitude", "maxPrice", "minPrice", "mode", "natures", "pricingUnit", "propertyTypes", "purposes", "remarks", "roadAccess", "status", "updated_at", "userId" FROM "Requirement";
DROP TABLE "Requirement";
ALTER TABLE "new_Requirement" RENAME TO "Requirement";
CREATE TABLE "new_Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "author_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Review_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("author_id", "comment", "created_at", "id", "rating", "receiver_id", "updated_at") SELECT "author_id", "comment", "created_at", "id", "rating", "receiver_id", "updated_at" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_type_idx" ON "users"("type");

-- CreateIndex
CREATE UNIQUE INDEX "account_creds_accountId_key" ON "account_creds"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_ownerId_actorId_key" ON "permissions"("ownerId", "actorId");
