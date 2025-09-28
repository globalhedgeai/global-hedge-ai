import { createHash } from 'crypto';

/**
 * Calculate deterministic eligibility for random reward based on user ID and UTC date
 * @param userId - User ID
 * @param dateKey - UTC date in YYYY-MM-DD format
 * @param winRate - Win rate (default 0.05 for 5%)
 * @returns Object with eligibility and amount
 */
export function calculateRandomRewardEligibility(
  userId: string, 
  dateKey: string, 
  winRate: number = 0.05,
  minAmount: number = 0.20,
  maxAmount: number = 2.00
): { eligible: boolean; amount: number } {
  // Compute hash for eligibility: SHA256(userId + ":" + dateKey)
  const eligibilityHash = createHash('sha256')
    .update(`${userId}:${dateKey}`)
    .digest('hex');
  
  // Convert first 8 characters to float in [0,1)
  const eligibilityFloat = parseInt(eligibilityHash.substring(0, 8), 16) / 0xFFFFFFFF;
  
  const eligible = eligibilityFloat < winRate;
  
  if (!eligible) {
    return { eligible: false, amount: 0 };
  }
  
  // Compute hash for amount: SHA256(userId + ":" + dateKey + ":amt")
  const amountHash = createHash('sha256')
    .update(`${userId}:${dateKey}:amt`)
    .digest('hex');
  
  // Convert first 8 characters to float in [0,1)
  const amountFloat = parseInt(amountHash.substring(0, 8), 16) / 0xFFFFFFFF;
  
  // Map to amount range and round to 2 decimals
  const amount = Math.round((minAmount + amountFloat * (maxAmount - minAmount)) * 100) / 100;
  
  return { eligible: true, amount };
}

/**
 * Get UTC date key in YYYY-MM-DD format
 */
export function getUTCDateKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
