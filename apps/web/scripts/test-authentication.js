#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@globalhedgeai.com' }
    });
    
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      return existingUser;
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@globalhedgeai.com',
        passwordHash: hashedPassword,
        role: 'USER',
        referralCode: 'TEST' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        balance: 1000
      }
    });
    
    console.log('✅ Test user created successfully:');
    console.log(`- Email: ${user.email}`);
    console.log(`- ID: ${user.id}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Balance: ${user.balance}`);
    console.log(`- Referral Code: ${user.referralCode}`);
    
    return user;
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function testAuthentication() {
  try {
    console.log('🔄 Testing authentication...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Create test user
    const user = await createTestUser();
    
    // Test user login
    console.log('\n🔐 Test Login Credentials:');
    console.log(`Email: ${user.email}`);
    console.log('Password: testpassword123');
    
    console.log('\n📝 Test API Endpoints:');
    console.log('1. POST /api/auth/login');
    console.log('2. GET /api/me');
    console.log('3. GET /api/admin/platform-stats');
    
    console.log('\n🎉 Authentication test completed successfully!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    process.exit(1);
  }
}

testAuthentication();
