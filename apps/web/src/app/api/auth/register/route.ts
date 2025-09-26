import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/password';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });

  const { email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ ok: false, error: 'email_taken' }, { status: 400 });

  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password), role: 'USER', referralCode: 'SELF' },
  });

  const res = NextResponse.json({ ok: true });
  const session = await getIronSession(req, res, sessionOptions) as IronSession;
  session.user = { id: user.id, email: user.email, role: user.role };
  await session.save();
  return res;
}