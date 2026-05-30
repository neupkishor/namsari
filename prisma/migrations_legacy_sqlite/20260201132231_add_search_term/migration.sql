-- CreateTable
CREATE TABLE "SearchTerm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "term" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "last_searched" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchTerm_term_key" ON "SearchTerm"("term");
