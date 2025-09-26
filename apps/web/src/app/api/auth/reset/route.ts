import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { passwordSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/password';

export async function POST(req: NextRequest) {
  const { email, token, password } = await req.json().catch(() => ({}));
  if (!email || !token || !passwordSchema.safeParse(password).success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const rec = await prisma.passwordResetToken.findFirst({ where: { tokenHash, user: { email } } });
  if (!rec || rec.expiresAt < new Date()) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.user.update({ where: { email }, data: { passwordHash: await hashPassword(password) } });
  await prisma.passwordResetToken.delete({ where: { id: rec.id } });
  return NextResponse.json({ ok: true });
}
