import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const messageSchema = z.object({
  body: z.string().min(1).max(2000)
});

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    // Get user's message thread with latest message
    const thread = await prisma.messageThread.findUnique({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        user: {
          select: { id: true, email: true }
        }
      }
    });

    if (!thread) {
      return NextResponse.json({ 
        ok: true, 
        threads: [],
        unreadCount: 0 
      });
    }

    const lastMessage = thread.messages[0] || null;

    return NextResponse.json({
      ok: true,
      threads: [{
        id: thread.id,
        userId: thread.userId,
        userEmail: thread.user.email,
        lastMessageAt: thread.lastMessageAt,
        unreadForUser: thread.unreadForUser,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          sender: lastMessage.sender,
          body: lastMessage.body,
          createdAt: lastMessage.createdAt
        } : null
      }],
      unreadCount: thread.unreadForUser
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_message' }, { status: 400 });
    }

    // Find or create message thread for user
    let thread = await prisma.messageThread.findUnique({
      where: { userId: session.user.id }
    });

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          userId: session.user.id,
          unreadForAdmin: 1
        }
      });
    } else {
      // Increment unread count for admin
      await prisma.messageThread.update({
        where: { id: thread.id },
        data: { 
          unreadForAdmin: { increment: 1 },
          lastMessageAt: new Date()
        }
      });
    }

    // Create the message
    const message = await prisma.threadMessage.create({
      data: {
        threadId: thread.id,
        sender: 'USER',
        body: parsed.data.body
      }
    });

    return NextResponse.json({
      ok: true,
      message: {
        id: message.id,
        sender: message.sender,
        body: message.body,
        createdAt: message.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
