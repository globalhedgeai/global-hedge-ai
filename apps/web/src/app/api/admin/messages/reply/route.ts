import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ReplySchema = z.object({
  threadId: z.string().min(1),
  message: z.string().min(1)
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    const body = await req.json();
    const parsed = ReplySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { threadId, message } = parsed.data;
    
    // Find the thread
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      include: { user: true }
    });
    
    if (!thread) {
      return NextResponse.json({ 
        ok: false, 
        error: "Thread not found" 
      }, { status: 404 });
    }
    
    // Create the reply message
    const replyMessage = await prisma.message.create({
      data: {
        threadId,
        body: message,
        isFromAdmin: true,
        senderId: session.user.id,
        senderEmail: session.user.email
      }
    });
    
    // Update thread's last message timestamp
    await prisma.messageThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: new Date(),
        unreadForUser: thread.unreadForUser + 1
      }
    });
    
    console.log(`Admin ${session.user.email} replied to thread ${threadId}: ${message}`);
    
    return NextResponse.json({
      ok: true,
      message: 'Reply sent successfully',
      reply: {
        id: replyMessage.id,
        body: replyMessage.body,
        createdAt: replyMessage.createdAt,
        isFromAdmin: replyMessage.isFromAdmin
      }
    });
    
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to send reply'
    }, { status: 500 });
  }
}
