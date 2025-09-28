import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const adminReplySchema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(2000)
});

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT')) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    // Get all message threads with their latest messages
    const threads = await prisma.messageThread.findMany({
      include: {
        user: {
          select: { id: true, email: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Get last 10 messages per thread
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadForAdmin, 0);

    return NextResponse.json({
      ok: true,
      threads: threads.map(thread => ({
        id: thread.id,
        userId: thread.userId,
        userEmail: thread.user.email,
        lastMessageAt: thread.lastMessageAt,
        unreadForUser: thread.unreadForUser,
        unreadForAdmin: thread.unreadForAdmin,
        messages: thread.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          body: msg.body,
          createdAt: msg.createdAt
        }))
      })),
      totalUnread
    });
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT')) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = adminReplySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_message' }, { status: 400 });
    }

    const { threadId, body: messageBody } = parsed.data;

    // Verify thread exists
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      return NextResponse.json({ ok: false, error: 'thread_not_found' }, { status: 404 });
    }

    // Create admin reply and update thread
    const result = await prisma.$transaction(async (tx) => {
      // Create the admin message
      const message = await tx.threadMessage.create({
        data: {
          threadId,
          sender: 'ADMIN',
          body: messageBody
        }
      });

      // Update thread with new message info
      await tx.messageThread.update({
        where: { id: threadId },
        data: {
          lastMessageAt: new Date(),
          unreadForUser: { increment: 1 },
          unreadForAdmin: 0 // Admin just replied, so no unread for admin
        }
      });

      return message;
    });

    return NextResponse.json({
      ok: true,
      message: {
        id: result.id,
        sender: result.sender,
        body: result.body,
        createdAt: result.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating admin reply:', error);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}