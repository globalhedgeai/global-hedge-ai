#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

interface AdminUser {
  email: string;
  password: string;
  role: 'ADMIN' | 'SUPPORT' | 'ACCOUNTING';
  name: string;
}

const adminUsers: AdminUser[] = [
  {
    email: 'admin@globalhedgeai.com',
    password: 'Admin123!@#',
    role: 'ADMIN',
    name: 'System Administrator'
  },
  {
    email: 'support@globalhedgeai.com',
    password: 'Support123!@#',
    role: 'SUPPORT',
    name: 'Support Manager'
  },
  {
    email: 'accounting@globalhedgeai.com',
    password: 'Accounting123!@#',
    role: 'ACCOUNTING',
    name: 'Accounting Manager'
  }
];

async function createAdminUsers() {
  console.log('🔐 Creating admin users...\n');

  for (const userData of adminUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, updating role...`);
        
        await prisma.user.update({
          where: { email: userData.email },
          data: { 
            role: userData.role,
            passwordHash: await hashPassword(userData.password)
          }
        });
        
        console.log(`✅ Updated ${userData.email} to ${userData.role}`);
      } else {
        // Create new admin user
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            passwordHash: await hashPassword(userData.password),
            role: userData.role,
            referralCode: `ADMIN_${userData.role}_${Date.now()}`,
            balance: 0
          }
        });

        console.log(`✅ Created ${userData.role} user: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   User ID: ${user.id}\n`);
      }
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.email}:`, error);
    }
  }
}

async function createDefaultPolicies() {
  console.log('📋 Creating default policies...\n');

  const defaultPolicies = [
    { key: 'depositFeePct', value: '2' },
    { key: 'withdrawFirstMinDays', value: '45' },
    { key: 'withdrawWeeklyFeePct', value: '5' },
    { key: 'withdrawMonthlyFeePct', value: '3' },
    { key: 'withdrawMonthlyThresholdDays', value: '30' },
    { key: 'baseMonthlyRate', value: '25' },
    { key: 'tier5Rate', value: '30' },
    { key: 'tier10Rate', value: '35' },
    { key: 'randomRewardEnabled', value: 'true' },
    { key: 'randomRewardChancePct', value: '5' },
    { key: 'randomRewardBonusPct', value: '20' },
    { key: 'maintenanceMode', value: 'false' },
    { key: 'minDepositAmount', value: '10' },
    { key: 'minWithdrawalAmount', value: '20' }
  ];

  for (const policy of defaultPolicies) {
    try {
      await prisma.policy.upsert({
        where: { key: policy.key },
        update: { value: policy.value },
        create: {
          key: policy.key,
          value: policy.value
        }
      });
      console.log(`✅ Policy ${policy.key}: ${policy.value}`);
    } catch (error) {
      console.error(`❌ Failed to create policy ${policy.key}:`, error);
    }
  }
}

async function createDefaultCryptocurrencyAddresses() {
  console.log('💰 Setting up cryptocurrency addresses...\n');

  // These should be replaced with your actual addresses
  const cryptoAddresses = [
    { key: 'USDT_TRC20_ADDRESS', value: 'TKaAamEouHjG9nZwoTPhgYUerejbBHGMop' },
    { key: 'USDT_ERC20_ADDRESS', value: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' },
    { key: 'BTC_ADDRESS', value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
    { key: 'ETH_ADDRESS', value: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' }
  ];

  for (const address of cryptoAddresses) {
    try {
      await prisma.policy.upsert({
        where: { key: address.key },
        update: { value: address.value },
        create: {
          key: address.key,
          value: address.value
        }
      });
      console.log(`✅ ${address.key}: ${address.value}`);
    } catch (error) {
      console.error(`❌ Failed to create address ${address.key}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Global Hedge AI - Admin Setup');
    console.log('================================\n');

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful\n');

    // Create admin users
    await createAdminUsers();
    
    // Create default policies
    await createDefaultPolicies();
    
    // Create cryptocurrency addresses
    await createDefaultCryptocurrencyAddresses();

    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\n📋 Admin Accounts Created:');
    console.log('   👑 ADMIN: admin@globalhedgeai.com');
    console.log('   🛠️  SUPPORT: support@globalhedgeai.com');
    console.log('   💰 ACCOUNTING: accounting@globalhedgeai.com');
    console.log('\n⚠️  IMPORTANT: Change these passwords after first login!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { createAdminUsers, createDefaultPolicies, createDefaultCryptocurrencyAddresses };
