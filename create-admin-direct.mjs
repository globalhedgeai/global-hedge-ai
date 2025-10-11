import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔄 Creating admin user...');
    
    // Hash password
    const passwordHash = await bcrypt.hash('Admin123!@#', 12);
    
    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@globalhedgeai.com' },
      update: {
        passwordHash,
        role: 'ADMIN',
        balance: 0
      },
      create: {
        email: 'admin@globalhedgeai.com',
        passwordHash,
        role: 'ADMIN',
        referralCode: 'ADMIN001',
        balance: 0
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin123!@#');
    console.log('👤 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log('📊 Total users in database:', userCount);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
