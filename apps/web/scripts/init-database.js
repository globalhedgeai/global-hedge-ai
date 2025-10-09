import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
    } else {
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 12);
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@globalhedgeai.com',
          passwordHash: adminPassword,
          role: 'ADMIN',
          referralCode: 'ADMIN2024',
          balance: 0
        }
      });
      console.log('✅ Admin user created:', adminUser.email);
    }
    
    // Initialize policies
    const policies = [
      { key: 'minWithdrawDaysFirst', value: '45' },
      { key: 'intervalWithdrawDaysWeekly', value: '7' },
      { key: 'intervalWithdrawDaysMonthly', value: '30' },
      { key: 'maxWithdrawPercent', value: '35' },
      { key: 'depositFee', value: '2' },
      { key: 'withdrawFeeWeekly', value: '7' },
      { key: 'withdrawFeeMonthly', value: '3' },
      { key: 'baseMonthly', value: '25' },
      { key: 'tier5', value: '30' },
      { key: 'tier10', value: '35' },
      { key: 'bonusChance', value: '5' },
      { key: 'bonusAmount', value: '0.2' }
    ];
    
    for (const policy of policies) {
      await prisma.policy.upsert({
        where: { key: policy.key },
        update: { value: policy.value },
        create: policy
      });
    }
    
    console.log('✅ Policies initialized');
    
    // Initialize platform stats
    await prisma.platformStats.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        totalUsers: 0,
        totalVolume: 0,
        activeTrades: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
      }
    });
    
    console.log('✅ Platform stats initialized');
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initializeDatabase();
