import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ApproveWithdrawalSchema = z.object({
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
    const parsed = ApproveWithdrawalSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.issues
      }, { status: 400 });
    }
    
    const { withdrawalId } = parsed.data;
    
    // Get withdrawal with user info
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            balance: true
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
    
    // Check if user has sufficient balance
    if (withdrawal.user.balance < withdrawal.amount) {
      return NextResponse.json({ 
        ok: false, 
        error: "Insufficient balance" 
      }, { status: 400 });
    }
    
    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update withdrawal status
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: { 
          status: 'APPROVED',
          reviewedAt: new Date()
        }
      });
      
      // Update user balance
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: {
            decrement: withdrawal.amount
          },
          reviewedAt: new Date()
        }
      });
    });
    
    console.log(`Admin ${session.user.email} approved withdrawal ${withdrawalId} for user ${withdrawal.user.email}`);
    
    return NextResponse.json({
      ok: true,
      message: 'Withdrawal approved successfully'
    });
    
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to approve withdrawal'
    }, { status: 500 });
  }
}
