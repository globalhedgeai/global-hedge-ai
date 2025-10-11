import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    const { threadId } = await params;
    
    // Get thread with messages
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    if (!thread) {
      return NextResponse.json({ 
        ok: false, 
        error: "Thread not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      ok: true,
      thread: {
        id: thread.id,
        userEmail: thread.user.email,
        messages: thread.messages.map(msg => ({
          id: msg.id,
          body: msg.body,
          createdAt: msg.createdAt,
          isFromAdmin: msg.isFromAdmin,
          senderEmail: msg.senderEmail
        })),
        lastMessageAt: thread.lastMessageAt,
        unreadForAdmin: thread.unreadForAdmin
      }
    });
    
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch thread messages'
    }, { status: 500 });
  }
}
