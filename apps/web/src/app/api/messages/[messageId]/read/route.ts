import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { messageId } = await params;

    // Find the message and verify it belongs to the user's thread
    const message = await prisma.threadMessage.findFirst({
      where: {
        id: messageId,
        thread: {
          userId: session.user.id
        }
      },
      include: {
        thread: true
      }
    });

    if (!message) {
      return NextResponse.json({ ok: false, error: 'message_not_found' }, { status: 404 });
    }

    // Mark the message as read by updating the thread's unread count
    // Since we're marking a message as read, we decrease the unread count
    await prisma.messageThread.update({
      where: { id: message.thread.id },
      data: {
        unreadForAdmin: Math.max(0, message.thread.unreadForAdmin - 1)
      }
    });

    return NextResponse.json({
      ok: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
