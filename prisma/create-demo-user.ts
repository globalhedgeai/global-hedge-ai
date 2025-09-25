import 'dotenv/config'
import { PrismaClient, Role } from '@prisma/client'
import path from 'path'
import fs from 'fs'

/**
 * استخدم نفس قاعدة الداتا الخاصة بالويب (apps/web/prisma/dev.db)
 * نبني مسار مطلق مضمون على ويندوز.
 */
const dbFile = path.resolve(process.cwd(), 'apps', 'web', 'prisma', 'dev.db')
if (!fs.existsSync(dbFile)) {
  console.error('❌ DB file not found at:', dbFile)
  process.exit(1)
}
const dbUrl = `file:${dbFile.replace(/\\/g, '/')}`

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
})

async function main() {
  await prisma.user.upsert({
    where: { id: 'demo-user-1' },
    update: {},
    create: {
      id: 'demo-user-1',
      email: 'demo@example.com',
      passwordHash: 'dev', // للتجربة فقط
      role: Role.USER,
      referralCode: 'DEMO1',
    },
  })
  console.log('✅ demo-user-1 ready (DB:', dbUrl, ')')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
