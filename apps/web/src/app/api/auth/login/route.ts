import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validators';
import { verifyPassword } from '@/lib/password';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ ok: false, error: 'bad_creds' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  const session = await getIronSession(req, res, sessionOptions) as IronSession;
  session.user = { id: user.id, email: user.email, role: user.role };
  await session.save();
  return res;
}