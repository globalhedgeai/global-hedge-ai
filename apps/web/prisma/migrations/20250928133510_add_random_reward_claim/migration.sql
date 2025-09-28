-- CreateTable
CREATE TABLE "RandomRewardClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimDate" TEXT NOT NULL,
    "meta" JSONB,
    CONSTRAINT "RandomRewardClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RandomRewardClaim_userId_claimDate_key" ON "RandomRewardClaim"("userId", "claimDate");
