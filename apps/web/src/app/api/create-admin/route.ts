import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('🔄 Creating admin user via API...');
    
    // Allow this endpoint without authentication for initial setup
    
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
    
    return NextResponse.json({
      ok: true,
      message: 'Admin user created successfully',
      admin: {
        email: admin.email,
        role: admin.role,
        id: admin.id
      },
      totalUsers: userCount
    });
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to create admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
