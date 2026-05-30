/*
  Warnings:

  - You are about to drop the column `is_active` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `posted_by` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `shows_on_top` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `takes_to` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `show_make_offer` on the `SystemSettings` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `expires` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdRate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdImpression" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adId" INTEGER NOT NULL,
    "viewerId" INTEGER,
    "sessionId" TEXT,
    "device" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdImpression_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Advertisement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdClick" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adId" INTEGER NOT NULL,
    "viewerId" INTEGER,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdClick_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Advertisement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountId" INTEGER NOT NULL,
    "partOf" INTEGER NOT NULL,
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Member_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_partOf_fkey" FOREIGN KEY ("partOf") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actionLink" TEXT,
    "actionId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "temp_account_id" TEXT NOT NULL,
    "account_id" INTEGER,
    "activity_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activity_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_type" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Advertisement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "isSponsoredRel" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "position" TEXT NOT NULL DEFAULT 'feed',
    "budget" REAL,
    "durationDays" INTEGER,
    "targetViews" INTEGER,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Advertisement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Advertisement" ("clicks", "created_at", "id", "image", "updated_at", "views") SELECT "clicks", "created_at", "id", "image", "updated_at", "views" FROM "Advertisement";
DROP TABLE "Advertisement";
ALTER TABLE "new_Advertisement" RENAME TO "Advertisement";
CREATE TABLE "new_PropertyType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "propertyCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_PropertyType" ("id", "name") SELECT "id", "name" FROM "PropertyType";
DROP TABLE "PropertyType";
ALTER TABLE "new_PropertyType" RENAME TO "PropertyType";
CREATE UNIQUE INDEX "PropertyType_name_key" ON "PropertyType"("name");
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
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Requirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Requirement" ("area", "cityVillage", "content", "created_at", "district", "facings", "id", "latitude", "longitude", "maxPrice", "minPrice", "mode", "natures", "pricingUnit", "propertyTypes", "purposes", "remarks", "roadAccess", "status", "updated_at", "userId") SELECT "area", "cityVillage", "content", "created_at", "district", "facings", "id", "latitude", "longitude", "maxPrice", "minPrice", "mode", "natures", "pricingUnit", "propertyTypes", "purposes", "remarks", "roadAccess", "status", "updated_at", "userId" FROM "Requirement";
DROP TABLE "Requirement";
ALTER TABLE "new_Requirement" RENAME TO "Requirement";
CREATE TABLE "new_SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "view_mode" TEXT NOT NULL DEFAULT 'classic',
    "show_like_button" BOOLEAN NOT NULL DEFAULT true,
    "show_share_button" BOOLEAN NOT NULL DEFAULT true,
    "show_comment_button" BOOLEAN NOT NULL DEFAULT true,
    "show_contact_agent" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_SystemSettings" ("id", "show_comment_button", "show_contact_agent", "show_like_button", "show_share_button", "updated_at", "view_mode") SELECT "id", "show_comment_button", "show_contact_agent", "show_like_button", "show_share_button", "updated_at", "view_mode" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
CREATE TABLE "new_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" DATETIME NOT NULL,
    "sessionKey" TEXT,
    "operatingId" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastActive" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sessions" ("id", "ipAddress", "lastActive", "operatingId", "sessionKey", "sessionToken", "userAgent", "userId") SELECT "id", "ipAddress", "lastActive", "operatingId", "sessionKey", "sessionToken", "userAgent", "userId" FROM "sessions";
DROP TABLE "sessions";
ALTER TABLE "new_sessions" RENAME TO "sessions";
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
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
INSERT INTO "new_users" ("agency_id", "bio", "contact_number", "cover_image", "created_on", "email", "id", "moreInfo", "name", "profile_picture", "roleId", "status", "type", "updated_at", "username") SELECT "agency_id", "bio", "contact_number", "cover_image", "created_on", "email", "id", "moreInfo", "name", "profile_picture", "roleId", "status", "type", "updated_at", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_type_idx" ON "users"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "AdImpression_adId_created_at_idx" ON "AdImpression"("adId", "created_at");

-- CreateIndex
CREATE INDEX "AdClick_adId_created_at_idx" ON "AdClick"("adId", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Member_accountId_partOf_key" ON "Member"("accountId", "partOf");
