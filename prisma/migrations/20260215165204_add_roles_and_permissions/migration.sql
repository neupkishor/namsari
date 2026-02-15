-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roleId" INTEGER NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "author_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Review_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AboutContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT 'About Namsari',
    "description" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "standard" TEXT,
    "group_info" TEXT,
    "content" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JobListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "salary_range" TEXT,
    "application_steps" TEXT DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "application_for_id" INTEGER NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "applicant_email" TEXT NOT NULL,
    "applicant_phone" TEXT NOT NULL,
    "resume_url" TEXT,
    "cover_letter" TEXT,
    "moreinformation" TEXT DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobApplication_application_for_id_fkey" FOREIGN KEY ("application_for_id") REFERENCES "JobListing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "emoji" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "cover_image" TEXT,
    "category" TEXT,
    "author" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BankRate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bank_id" INTEGER NOT NULL,
    "interest_from" DATETIME NOT NULL,
    "interest" REAL NOT NULL,
    "interest_to" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "BankRate_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "Bank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT NOT NULL,
    "takes_to" TEXT,
    "posted_by" TEXT,
    "shows_on_top" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "updated_at" DATETIME NOT NULL,
    "agency_id" INTEGER,
    "roleId" INTEGER,
    CONSTRAINT "User_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("account_type", "bio", "contact_number", "cover_image", "created_on", "email", "id", "moreInfo", "name", "password", "profile_picture", "status", "updated_at", "username") SELECT "account_type", "bio", "contact_number", "cover_image", "created_on", "email", "id", "moreInfo", "name", "password", "profile_picture", "status", "updated_at", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_resource_key" ON "RolePermission"("roleId", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "JobListing_slug_key" ON "JobListing"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SupportArticle_slug_key" ON "SupportArticle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_slug_key" ON "Bank"("slug");
