/*
  Warnings:

  - You are about to drop the column `network` on the `Deposit` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PlatformStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" REAL NOT NULL DEFAULT 0,
    "activeTrades" INTEGER NOT NULL DEFAULT 0,
    "totalDeposits" REAL NOT NULL DEFAULT 0,
    "totalWithdrawals" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deposit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "txId" TEXT NOT NULL,
    "proofImageUrl" TEXT NOT NULL,
    "cryptocurrency" TEXT NOT NULL DEFAULT 'USDT_TRC20',
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
INSERT INTO "new_Deposit" ("amount", "createdAt", "effectiveAt", "id", "proofImageUrl", "reviewedAt", "reviewedBy", "rewardAmount", "rewardMeta", "status", "toAddress", "txId", "userId") SELECT "amount", "createdAt", "effectiveAt", "id", "proofImageUrl", "reviewedAt", "reviewedBy", "rewardAmount", "rewardMeta", "status", "toAddress", "txId", "userId" FROM "Deposit";
DROP TABLE "Deposit";
ALTER TABLE "new_Deposit" RENAME TO "Deposit";
CREATE INDEX "Deposit_userId_idx" ON "Deposit"("userId");
CREATE INDEX "Deposit_status_idx" ON "Deposit"("status");
CREATE INDEX "Deposit_createdAt_idx" ON "Deposit"("createdAt");
CREATE INDEX "Deposit_effectiveAt_idx" ON "Deposit"("effectiveAt");
CREATE TABLE "new_Withdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "cryptocurrency" TEXT NOT NULL DEFAULT 'USDT_TRC20',
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
INSERT INTO "new_Withdrawal" ("amount", "appliedRule", "createdAt", "effectiveAt", "feeAmount", "feePct", "id", "netAmount", "policySnapshot", "reviewedAt", "reviewedBy", "status", "toAddress", "txId", "userId") SELECT "amount", "appliedRule", "createdAt", "effectiveAt", "feeAmount", "feePct", "id", "netAmount", "policySnapshot", "reviewedAt", "reviewedBy", "status", "toAddress", "txId", "userId" FROM "Withdrawal";
DROP TABLE "Withdrawal";
ALTER TABLE "new_Withdrawal" RENAME TO "Withdrawal";
CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId");
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");
CREATE INDEX "Withdrawal_effectiveAt_idx" ON "Withdrawal"("effectiveAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PlatformStats_createdAt_idx" ON "PlatformStats"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "DailyRewardClaim_userId_idx" ON "DailyRewardClaim"("userId");

-- CreateIndex
CREATE INDEX "DailyRewardClaim_claimDate_idx" ON "DailyRewardClaim"("claimDate");

-- CreateIndex
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

-- CreateIndex
CREATE INDEX "Message_type_idx" ON "Message"("type");

-- CreateIndex
CREATE INDEX "MessageThread_lastMessageAt_idx" ON "MessageThread"("lastMessageAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Policy_key_idx" ON "Policy"("key");

-- CreateIndex
CREATE INDEX "RandomBonus_userId_idx" ON "RandomBonus"("userId");

-- CreateIndex
CREATE INDEX "RandomBonus_date_idx" ON "RandomBonus"("date");

-- CreateIndex
CREATE INDEX "RandomRewardClaim_userId_idx" ON "RandomRewardClaim"("userId");

-- CreateIndex
CREATE INDEX "RandomRewardClaim_claimDate_idx" ON "RandomRewardClaim"("claimDate");

-- CreateIndex
CREATE INDEX "Referral_inviterId_idx" ON "Referral"("inviterId");

-- CreateIndex
CREATE INDEX "Referral_inviteeId_idx" ON "Referral"("inviteeId");

-- CreateIndex
CREATE INDEX "Referral_createdAt_idx" ON "Referral"("createdAt");

-- CreateIndex
CREATE INDEX "ReferralCode_ownerUserId_idx" ON "ReferralCode"("ownerUserId");

-- CreateIndex
CREATE INDEX "ReferralStats_tier_idx" ON "ReferralStats"("tier");

-- CreateIndex
CREATE INDEX "ThreadMessage_sender_idx" ON "ThreadMessage"("sender");

-- CreateIndex
CREATE INDEX "Tier_minInvites_idx" ON "Tier"("minInvites");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_invitedById_idx" ON "User"("invitedById");
