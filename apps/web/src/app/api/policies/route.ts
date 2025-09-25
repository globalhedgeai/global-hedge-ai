export const runtime = 'nodejs'   // ظ…ظ‡ظ… ظ„ظ…ط¹ط§ظ…ظ„ط§طھ ط§ظ„ظ…ظ„ظپ
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ظ…ظ† api â†’ app â†’ src â†’ lib

export async function GET() {
  const policies = await prisma.policy.findMany({ orderBy: { key: 'asc' } })
  return NextResponse.json({ ok: true, count: policies.length, data: policies })
}


