import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Updating admin role via API...');
    
    // Update user role to ADMIN
    const admin = await prisma.user.update({
      where: { email: 'admin@globalhedgeai.com' },
      data: {
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Admin role updated successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    
    return NextResponse.json({
      ok: true,
      message: 'Admin role updated successfully',
      admin: {
        email: admin.email,
        role: admin.role,
        id: admin.id
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating admin role:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to update admin role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
