import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ User count: ${userCount}`);
    
    // Test creating a test user (then delete it)
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'test-hash',
        referralCode: 'TEST123'
      }
    });
    console.log('✅ Test user created:', testUser.id);
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test user deleted');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
