-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_number" TEXT,
    "account_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
