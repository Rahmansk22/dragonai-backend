-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT DEFAULT 'local',
    "providerId" TEXT,
    "resetOtp" TEXT DEFAULT '',
    "resetOtpExpiry" DATETIME
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "provider", "providerId", "resetOtp", "resetOtpExpiry") SELECT "createdAt", "email", "id", "name", "password", "provider", "providerId", "resetOtp", "resetOtpExpiry" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
