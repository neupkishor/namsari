-- CreateTable
CREATE TABLE "Requirement" (
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
    CONSTRAINT "Requirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
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
    CONSTRAINT "Collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("created_at", "description", "id", "is_public", "moreInfo", "name", "slug", "type", "updated_at", "user_id") SELECT "created_at", "description", "id", "is_public", "moreInfo", "name", "slug", "type", "updated_at", "user_id" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "contact_number" TEXT,
    "account_type" TEXT,
    "bio" TEXT,
    "profile_picture" TEXT,
    "cover_image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "moreInfo" TEXT,
    "created_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("account_type", "bio", "contact_number", "created_on", "id", "name", "profile_picture", "updated_at", "username") SELECT "account_type", "bio", "contact_number", "created_on", "id", "name", "profile_picture", "updated_at", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
