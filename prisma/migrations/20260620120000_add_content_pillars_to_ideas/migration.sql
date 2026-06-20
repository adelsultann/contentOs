-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Idea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "rawInput" TEXT NOT NULL DEFAULT '',
    "topic" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'captured',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "contentPillarId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Idea_contentPillarId_fkey" FOREIGN KEY ("contentPillarId") REFERENCES "ContentPillar" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Idea" ("createdAt", "id", "priority", "rawInput", "status", "title", "topic", "updatedAt") SELECT "createdAt", "id", "priority", "rawInput", "status", "title", "topic", "updatedAt" FROM "Idea";
DROP TABLE "Idea";
ALTER TABLE "new_Idea" RENAME TO "Idea";
CREATE INDEX "Idea_contentPillarId_idx" ON "Idea"("contentPillarId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
