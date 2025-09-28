import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    // Reset unread count for user
    await prisma.messageThread.updateMany({
      where: { userId: session.user.id },
      data: { unreadForUser: 0 }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
