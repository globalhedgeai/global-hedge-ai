/*
  Warnings:

  - You are about to drop the column `createdAt` on the `DailyRewardClaim` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `DailyRewardClaim` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyRewardClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL DEFAULT 0,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimDate" DATETIME NOT NULL,
    "meta" JSONB,
    CONSTRAINT "DailyRewardClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyRewardClaim" ("amount", "claimDate", "id", "userId") SELECT "amount", "claimDate", "id", "userId" FROM "DailyRewardClaim";
DROP TABLE "DailyRewardClaim";
ALTER TABLE "new_DailyRewardClaim" RENAME TO "DailyRewardClaim";
CREATE UNIQUE INDEX "DailyRewardClaim_userId_claimDate_key" ON "DailyRewardClaim"("userId", "claimDate");
CREATE TABLE "new_Deposit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "txId" TEXT NOT NULL,
    "proofImageUrl" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "effectiveAt" DATETIME,
    "rewardAmount" DECIMAL NOT NULL DEFAULT 0,
    "rewardMeta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Deposit" ("amount", "createdAt", "effectiveAt", "id", "network", "proofImageUrl", "reviewedAt", "reviewedBy", "status", "toAddress", "txId", "userId") SELECT "amount", "createdAt", "effectiveAt", "id", "network", "proofImageUrl", "reviewedAt", "reviewedBy", "status", "toAddress", "txId", "userId" FROM "Deposit";
DROP TABLE "Deposit";
ALTER TABLE "new_Deposit" RENAME TO "Deposit";
CREATE INDEX "Deposit_createdAt_idx" ON "Deposit"("createdAt");
CREATE TABLE "new_Withdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "toAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "txId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "effectiveAt" DATETIME,
    "feePct" DECIMAL NOT NULL DEFAULT 0,
    "feeAmount" DECIMAL NOT NULL DEFAULT 0,
    "netAmount" DECIMAL NOT NULL DEFAULT 0,
    "policySnapshot" TEXT,
    "appliedRule" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Withdrawal" ("amount", "createdAt", "effectiveAt", "id", "reviewedAt", "reviewedBy", "status", "toAddress", "txId", "userId") SELECT "amount", "createdAt", "effectiveAt", "id", "reviewedAt", "reviewedBy", "status", "toAddress", "txId", "userId" FROM "Withdrawal";
DROP TABLE "Withdrawal";
ALTER TABLE "new_Withdrawal" RENAME TO "Withdrawal";
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
