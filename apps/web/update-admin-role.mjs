import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdminRole() {
  try {
    console.log('🔄 Updating admin role...');
    
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
    
  } catch (error) {
    console.error('❌ Error updating admin role:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateAdminRole()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
