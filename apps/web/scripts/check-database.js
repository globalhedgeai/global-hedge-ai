import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    console.log('🔄 Checking database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const userCount = await prisma.user.count();
    console.log(`✅ Users table accessible, count: ${userCount}`);
    
    const policyCount = await prisma.policy.count();
    console.log(`✅ Policies table accessible, count: ${policyCount}`);
    
    // Check admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (adminUser) {
      console.log(`✅ Admin user exists: ${adminUser.email}`);
    } else {
      console.log('⚠️ No admin user found');
    }
    
    // Check environment variables
    console.log('🔍 Environment check:');
    console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
    console.log(`- SESSION_SECRET: ${process.env.SESSION_SECRET ? 'Set' : 'Not set'}`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
    
    console.log('🎉 Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
