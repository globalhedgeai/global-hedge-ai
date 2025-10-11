import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MarkReadSchema = z.object({
  threadId: z.string().min(1)
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
    const parsed = MarkReadSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { threadId } = parsed.data;
    
    // Mark thread as read for admin
    await prisma.messageThread.update({
      where: { id: threadId },
      data: {
        unreadForAdmin: 0
      }
    });
    
    return NextResponse.json({
      ok: true,
      message: 'Thread marked as read'
    });
    
  } catch (error) {
    console.error('Error marking thread as read:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to mark thread as read'
    }, { status: 500 });
  }
}
