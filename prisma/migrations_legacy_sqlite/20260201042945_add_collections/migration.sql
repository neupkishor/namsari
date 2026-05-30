-- AlterTable
ALTER TABLE "User" ADD COLUMN "profile_picture" TEXT;

-- CreateTable
CREATE TABLE "Agency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profile_picture" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "view_mode" TEXT NOT NULL DEFAULT 'classic',
    "show_like_button" BOOLEAN NOT NULL DEFAULT true,
    "show_share_button" BOOLEAN NOT NULL DEFAULT true,
    "show_comment_button" BOOLEAN NOT NULL DEFAULT true,
    "show_contact_agent" BOOLEAN NOT NULL DEFAULT true,
    "show_make_offer" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CollectionToProperty" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CollectionToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CollectionToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
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
CREATE UNIQUE INDEX "Agency_username_key" ON "Agency"("username");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToProperty_AB_unique" ON "_CollectionToProperty"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToProperty_B_index" ON "_CollectionToProperty"("B");
