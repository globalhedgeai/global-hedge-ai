/*
  Warnings:

  - You are about to drop the column `amountNet` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the column `amountRequested` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the column `cadence` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the column `feePercent` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the column `network` on the `Withdrawal` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "walletAddress" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Withdrawal" ("createdAt", "effectiveAt", "id", "reviewedAt", "reviewedBy", "status", "toAddress", "txId", "userId") SELECT "createdAt", "effectiveAt", "id", "reviewedAt", "reviewedBy", "status", "toAddress", "txId", "userId" FROM "Withdrawal";
DROP TABLE "Withdrawal";
ALTER TABLE "new_Withdrawal" RENAME TO "Withdrawal";
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
