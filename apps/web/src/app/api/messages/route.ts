import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SendMessageSchema = z.object({
  body: z.string().min(1).max(2000)
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Get or create message thread for user
    let thread = await prisma.messageThread.findFirst({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Get last 50 messages
        }
      }
    });
    
    // If no thread exists, create one
    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          userId: session.user.id,
          lastMessageAt: new Date(),
          unreadForUser: 0,
          unreadForAdmin: 0
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 50
          }
        }
      });
    }
    
    return NextResponse.json({
      ok: true,
      thread: {
        id: thread.id,
        userId: thread.userId,
        lastMessageAt: thread.lastMessageAt,
        unreadForUser: thread.unreadForUser,
        unreadForAdmin: thread.unreadForAdmin,
        messages: thread.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          body: msg.body,
          createdAt: msg.createdAt
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch messages'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    const parsed = SendMessageSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid message data",
        details: parsed.error.issues
      }, { status: 400 });
    }
    
    const { body: messageBody } = parsed.data;
    
    // Get or create message thread for user
    let thread = await prisma.messageThread.findFirst({
      where: { userId: session.user.id }
    });
    
    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          userId: session.user.id,
          lastMessageAt: new Date(),
          unreadForUser: 0,
          unreadForAdmin: 0
        }
      });
    }
    
    // Create message and update thread
    const result = await prisma.$transaction(async (tx) => {
      // Create the user message
      const message = await tx.threadMessage.create({
        data: {
          threadId: thread.id,
          sender: 'USER',
          body: messageBody
        }
      });
      
      // Update thread with new message info
      await tx.messageThread.update({
        where: { id: thread.id },
        data: {
          lastMessageAt: new Date(),
          unreadForUser: 0, // User just sent, so no unread for user
          unreadForAdmin: { increment: 1 } // Admin has new unread message
        }
      });
      
      return message;
    });
    
    console.log(`User ${session.user.email} sent message: ${messageBody}`);
    
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
    console.error('Error sending message:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to send message'
    }, { status: 500 });
  }
}