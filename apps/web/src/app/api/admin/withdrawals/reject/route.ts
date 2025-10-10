import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RejectWithdrawalSchema = z.object({
  withdrawalId: z.string().min(1)
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    const body = await req.json();
    const parsed = RejectWithdrawalSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { withdrawalId } = parsed.data;
    
    // Get withdrawal
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    if (!withdrawal) {
      return NextResponse.json({ 
        ok: false, 
        error: "Withdrawal not found" 
      }, { status: 404 });
    }
    
    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json({ 
        ok: false, 
        error: "Withdrawal is not pending" 
      }, { status: 400 });
    }
    
    // Update withdrawal status
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { 
        status: 'REJECTED',
        updatedAt: new Date()
      }
    });
    
    console.log(`Admin ${session.user.email} rejected withdrawal ${withdrawalId} for user ${withdrawal.user.email}`);
    
    return NextResponse.json({
      ok: true,
      message: 'Withdrawal rejected successfully'
    });
    
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to reject withdrawal'
    }, { status: 500 });
  }
}
