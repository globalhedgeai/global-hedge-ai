import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Hash password
    const passwordHash = await bcrypt.hash('GlobalHedge2024!@#AdminSecure', 12);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@globalhedgeai.com',
        passwordHash: passwordHash,
        role: 'ADMIN',
        referralCode: 'ADMIN2024',
        balance: 0
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Referral Code:', admin.referralCode);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
