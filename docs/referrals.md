# Referral System Documentation

## Overview

The referral system allows users to invite others and earn rewards based on their referral tier. The system tracks invited users and provides configurable tier-based benefits.

## Database Models

### ReferralCode
- `id`: Unique identifier
- `code`: Unique referral code (generated from user ID)
- `ownerUserId`: ID of the user who owns this code
- `createdAt`: When the code was created
- `isActive`: Whether the code is currently active

### ReferralStats
- `id`: Unique identifier
- `userId`: ID of the user these stats belong to
- `invitedCount`: Number of users invited by this user
- `tier`: Current tier level (1, 2, 3, etc.)
- `updatedAt`: Last time stats were updated

### User Model Enhancement
- `invitedById`: ID of the user who invited this user (nullable)

## API Endpoints

### GET /api/referrals
Returns referral data for the authenticated user:
- `referralCode`: User's referral code
- `stats`: Invitation count and current tier
- `invitedUsers`: List of invited users with their details

### Registration Enhancement
The registration endpoint now accepts an optional `referralCode` parameter. When provided:
1. Validates the referral code exists and is active
2. Sets the `invitedById` field on the new user
3. Updates the referrer's invitation count and stats

## Tier System

The tier system is designed to be configurable through environment variables or policies. The following keys should be defined:

### Environment Variables
```env
# Tier 1 Configuration
REF_TIER1_COUNT=5
REF_TIER1_BONUS_PERCENT=2.5

# Tier 2 Configuration  
REF_TIER2_COUNT=10
REF_TIER2_BONUS_PERCENT=5.0

# Tier 3 Configuration
REF_TIER3_COUNT=20
REF_TIER3_BONUS_PERCENT=7.5

# Tier 4 Configuration
REF_TIER4_COUNT=50
REF_TIER4_BONUS_PERCENT=10.0
```

### Policy Keys (Alternative to ENV)
- `REF_TIER1_COUNT`: Number of invites needed for Tier 1
- `REF_TIER1_BONUS_PERCENT`: Bonus percentage for Tier 1
- `REF_TIER2_COUNT`: Number of invites needed for Tier 2
- `REF_TIER2_BONUS_PERCENT`: Bonus percentage for Tier 2
- `REF_TIER3_COUNT`: Number of invites needed for Tier 3
- `REF_TIER3_BONUS_PERCENT`: Bonus percentage for Tier 3
- `REF_TIER4_COUNT`: Number of invites needed for Tier 4
- `REF_TIER4_BONUS_PERCENT`: Bonus percentage for Tier 4

## Tier Benefits

Each tier provides different benefits:

- **Tier 1**: Basic referral bonuses
- **Tier 2**: Enhanced bonuses and priority support
- **Tier 3**: Higher bonuses and exclusive features
- **Tier 4**: Maximum bonuses and VIP treatment

## Implementation Notes

1. **Referral Code Generation**: Codes are generated using the last 8 characters of the user's ID, converted to uppercase.

2. **Tier Calculation**: Tiers are calculated based on the `invitedCount` in `ReferralStats`. The system automatically updates tiers when invitation counts change.

3. **One-Time Referral**: Each user can only be referred once. The `invitedById` field is set only during registration and cannot be changed.

4. **Stats Tracking**: The `ReferralStats` model is automatically created/updated when a user is successfully referred.

## Future Enhancements

- Automatic tier upgrades based on invitation milestones
- Referral bonus calculations and payouts
- Referral analytics and reporting
- Multi-level referral tracking
- Referral leaderboards

## Security Considerations

- Referral codes are validated server-side
- Users cannot modify their referral relationship after registration
- Referral stats are read-only for users (admin-only modification)
- All referral operations are logged for audit purposes
