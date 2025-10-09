#!/usr/bin/env tsx

import { PrismaClient as SQLiteClient } from '@prisma/client';
import { PrismaClient as PostgreSQLClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.production' });

const sqliteClient = new SQLiteClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

const postgresClient = new PostgreSQLClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

interface MigrationStats {
  users: number;
  deposits: number;
  withdrawals: number;
  dailyRewardClaims: number;
  randomRewardClaims: number;
  messages: number;
  referralStats: number;
  referralCodes: number;
  policies: number;
  auditLogs: number;
  messageThreads: number;
  passwordResetTokens: number;
}

async function migrateData(): Promise<MigrationStats> {
  console.log('🚀 Starting data migration from SQLite to PostgreSQL...');
  console.log('📊 This may take a few minutes depending on data size...\n');

  const stats: MigrationStats = {
    users: 0,
    deposits: 0,
    withdrawals: 0,
    dailyRewardClaims: 0,
    randomRewardClaims: 0,
    messages: 0,
    referralStats: 0,
    referralCodes: 0,
    policies: 0,
    auditLogs: 0,
    messageThreads: 0,
    passwordResetTokens: 0
  };

  try {
    // Test PostgreSQL connection
    console.log('🔍 Testing PostgreSQL connection...');
    await postgresClient.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL connection successful\n');

    // Start transaction for atomic migration
    await postgresClient.$transaction(async (tx) => {
      console.log('🧹 Cleaning existing PostgreSQL data...');
      
      // Clear existing data in correct order (respecting foreign keys)
      await tx.passwordResetToken.deleteMany();
      await tx.message.deleteMany();
      await tx.messageThread.deleteMany();
      await tx.auditLog.deleteMany();
      await tx.policy.deleteMany();
      await tx.referralCode.deleteMany();
      await tx.referralStats.deleteMany();
      await tx.randomRewardClaim.deleteMany();
      await tx.dailyRewardClaim.deleteMany();
      await tx.withdrawal.deleteMany();
      await tx.deposit.deleteMany();
      await tx.user.deleteMany();
      
      console.log('✅ Existing data cleared\n');

      // Migrate Users (must be first due to foreign key constraints)
      console.log('👥 Migrating users...');
      const users = await sqliteClient.user.findMany({
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          createdAt: true,
          balance: true,
          firstDepositAt: true,
          lastWithdrawalAt: true,
          referralCode: true,
          walletAddress: true,
          invitedById: true
        }
      });
      
      if (users.length > 0) {
        await tx.user.createMany({ data: users });
        stats.users = users.length;
        console.log(`✅ Migrated ${users.length} users`);
      } else {
        console.log('ℹ️  No users to migrate');
      }

      // Migrate Deposits
      console.log('💰 Migrating deposits...');
      const deposits = await sqliteClient.deposit.findMany({
        select: {
          id: true,
          userId: true,
          amount: true,
          txId: true,
          proofImageUrl: true,
          cryptocurrency: true,
          toAddress: true,
          status: true,
          reviewedBy: true,
          reviewedAt: true,
          effectiveAt: true,
          rewardAmount: true,
          rewardMeta: true,
          createdAt: true
        }
      });
      
      if (deposits.length > 0) {
        await tx.deposit.createMany({ data: deposits });
        stats.deposits = deposits.length;
        console.log(`✅ Migrated ${deposits.length} deposits`);
      } else {
        console.log('ℹ️  No deposits to migrate');
      }

      // Migrate Withdrawals
      console.log('💸 Migrating withdrawals...');
      const withdrawals = await sqliteClient.withdrawal.findMany({
        select: {
          id: true,
          userId: true,
          amount: true,
          cryptocurrency: true,
          toAddress: true,
          status: true,
          txId: true,
          reviewedBy: true,
          reviewedAt: true,
          effectiveAt: true,
          feePct: true,
          feeAmount: true,
          netAmount: true,
          policySnapshot: true,
          appliedRule: true,
          createdAt: true
        }
      });
      
      if (withdrawals.length > 0) {
        await tx.withdrawal.createMany({ data: withdrawals });
        stats.withdrawals = withdrawals.length;
        console.log(`✅ Migrated ${withdrawals.length} withdrawals`);
      } else {
        console.log('ℹ️  No withdrawals to migrate');
      }

      // Migrate Daily Reward Claims
      console.log('🎁 Migrating daily reward claims...');
      const dailyRewardClaims = await sqliteClient.dailyRewardClaim.findMany();
      
      if (dailyRewardClaims.length > 0) {
        await tx.dailyRewardClaim.createMany({ 
          data: dailyRewardClaims.map((claim: any) => ({
            ...claim,
            meta: claim.meta ? claim.meta : undefined
          }))
        });
        stats.dailyRewardClaims = dailyRewardClaims.length;
        console.log(`✅ Migrated ${dailyRewardClaims.length} daily reward claims`);
      } else {
        console.log('ℹ️  No daily reward claims to migrate');
      }

      // Migrate Random Reward Claims
      console.log('🎲 Migrating random reward claims...');
      const randomRewardClaims = await sqliteClient.randomRewardClaim.findMany();
      
      if (randomRewardClaims.length > 0) {
        await tx.randomRewardClaim.createMany({ 
          data: randomRewardClaims.map((claim: any) => ({
            ...claim,
            meta: claim.meta ? claim.meta : undefined
          }))
        });
        stats.randomRewardClaims = randomRewardClaims.length;
        console.log(`✅ Migrated ${randomRewardClaims.length} random reward claims`);
      } else {
        console.log('ℹ️  No random reward claims to migrate');
      }

      // Migrate Message Threads (must be before messages)
      console.log('💬 Migrating message threads...');
      const messageThreads = await sqliteClient.messageThread.findMany();
      
      if (messageThreads.length > 0) {
        await tx.messageThread.createMany({ data: messageThreads });
        stats.messageThreads = messageThreads.length;
        console.log(`✅ Migrated ${messageThreads.length} message threads`);
      } else {
        console.log('ℹ️  No message threads to migrate');
      }

      // Migrate Messages
      console.log('📨 Migrating messages...');
      const messages = await sqliteClient.message.findMany();
      
      if (messages.length > 0) {
        await tx.message.createMany({ data: messages });
        stats.messages = messages.length;
        console.log(`✅ Migrated ${messages.length} messages`);
      } else {
        console.log('ℹ️  No messages to migrate');
      }

      // Migrate Referral Stats
      console.log('📊 Migrating referral stats...');
      const referralStats = await sqliteClient.referralStats.findMany();
      
      if (referralStats.length > 0) {
        await tx.referralStats.createMany({ data: referralStats });
        stats.referralStats = referralStats.length;
        console.log(`✅ Migrated ${referralStats.length} referral stats`);
      } else {
        console.log('ℹ️  No referral stats to migrate');
      }

      // Migrate Referral Codes
      console.log('🔗 Migrating referral codes...');
      const referralCodes = await sqliteClient.referralCode.findMany();
      
      if (referralCodes.length > 0) {
        await tx.referralCode.createMany({ data: referralCodes });
        stats.referralCodes = referralCodes.length;
        console.log(`✅ Migrated ${referralCodes.length} referral codes`);
      } else {
        console.log('ℹ️  No referral codes to migrate');
      }

      // Migrate Policies
      console.log('📋 Migrating policies...');
      const policies = await sqliteClient.policy.findMany();
      
      if (policies.length > 0) {
        await tx.policy.createMany({ data: policies });
        stats.policies = policies.length;
        console.log(`✅ Migrated ${policies.length} policies`);
      } else {
        console.log('ℹ️  No policies to migrate');
      }

      // Migrate Audit Logs
      console.log('📝 Migrating audit logs...');
      const auditLogs = await sqliteClient.auditLog.findMany();
      
      if (auditLogs.length > 0) {
        await tx.auditLog.createMany({ data: auditLogs });
        stats.auditLogs = auditLogs.length;
        console.log(`✅ Migrated ${auditLogs.length} audit logs`);
      } else {
        console.log('ℹ️  No audit logs to migrate');
      }

      // Migrate Password Reset Tokens
      console.log('🔑 Migrating password reset tokens...');
      const passwordResetTokens = await sqliteClient.passwordResetToken.findMany();
      
      if (passwordResetTokens.length > 0) {
        await tx.passwordResetToken.createMany({ data: passwordResetTokens });
        stats.passwordResetTokens = passwordResetTokens.length;
        console.log(`✅ Migrated ${passwordResetTokens.length} password reset tokens`);
      } else {
        console.log('ℹ️  No password reset tokens to migrate');
      }
    });

    console.log('\n🎉 Data migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`   👥 Users: ${stats.users}`);
    console.log(`   💰 Deposits: ${stats.deposits}`);
    console.log(`   💸 Withdrawals: ${stats.withdrawals}`);
    console.log(`   🎁 Daily Reward Claims: ${stats.dailyRewardClaims}`);
    console.log(`   🎲 Random Reward Claims: ${stats.randomRewardClaims}`);
    console.log(`   💬 Message Threads: ${stats.messageThreads}`);
    console.log(`   📨 Messages: ${stats.messages}`);
    console.log(`   📊 Referral Stats: ${stats.referralStats}`);
    console.log(`   🔗 Referral Codes: ${stats.referralCodes}`);
    console.log(`   📋 Policies: ${stats.policies}`);
    console.log(`   📝 Audit Logs: ${stats.auditLogs}`);
    console.log(`   🔑 Password Reset Tokens: ${stats.passwordResetTokens}`);

    const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);
    console.log(`\n📈 Total Records Migrated: ${totalRecords}`);

    return stats;

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

async function verifyMigration(stats: MigrationStats): Promise<void> {
  console.log('\n🔍 Verifying migration...');
  
  try {
    const postgresClient = new PostgreSQLClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    const verification = {
      users: await postgresClient.user.count(),
      deposits: await postgresClient.deposit.count(),
      withdrawals: await postgresClient.withdrawal.count(),
      dailyRewardClaims: await postgresClient.dailyRewardClaim.count(),
      randomRewardClaims: await postgresClient.randomRewardClaim.count(),
      messages: await postgresClient.message.count(),
      referralStats: await postgresClient.referralStats.count(),
      referralCodes: await postgresClient.referralCode.count(),
      policies: await postgresClient.policy.count(),
      auditLogs: await postgresClient.auditLog.count(),
      messageThreads: await postgresClient.messageThread.count(),
      passwordResetTokens: await postgresClient.passwordResetToken.count()
    };

    console.log('\n✅ Verification Results:');
    let allMatch = true;
    
    for (const [table, expectedCount] of Object.entries(stats)) {
      const actualCount = verification[table as keyof typeof verification];
      const match = expectedCount === actualCount;
      const status = match ? '✅' : '❌';
      
      console.log(`   ${status} ${table}: ${actualCount}/${expectedCount}`);
      
      if (!match) {
        allMatch = false;
      }
    }

    if (allMatch) {
      console.log('\n🎉 All data verified successfully!');
    } else {
      console.log('\n⚠️  Some data counts do not match. Please review the migration.');
    }

    await postgresClient.$disconnect();
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Global Hedge AI - Database Migration Tool');
    console.log('📦 SQLite → PostgreSQL Migration\n');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.error('   Please set it to your PostgreSQL connection string');
      process.exit(1);
    }

    // Run migration
    const stats = await migrateData();
    
    // Verify migration
    await verifyMigration(stats);
    
    console.log('\n🎯 Migration completed! Your application is ready to use PostgreSQL.');
    console.log('💡 Remember to update your application configuration to use PostgreSQL.');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { migrateData, verifyMigration };
