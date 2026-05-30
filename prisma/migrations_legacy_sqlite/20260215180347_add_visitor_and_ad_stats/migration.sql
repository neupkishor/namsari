-- CreateTable
CREATE TABLE "Visitor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "session_id" TEXT NOT NULL,
    "page_url" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Advertisement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT NOT NULL,
    "takes_to" TEXT,
    "posted_by" TEXT,
    "shows_on_top" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Advertisement" ("created_at", "id", "image", "is_active", "posted_by", "shows_on_top", "takes_to", "updated_at") SELECT "created_at", "id", "image", "is_active", "posted_by", "shows_on_top", "takes_to", "updated_at" FROM "Advertisement";
DROP TABLE "Advertisement";
ALTER TABLE "new_Advertisement" RENAME TO "Advertisement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
