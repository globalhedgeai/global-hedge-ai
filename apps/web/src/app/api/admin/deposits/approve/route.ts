import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ApproveDepositSchema = z.object({
  depositId: z.string().min(1)
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
    const parsed = ApproveDepositSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { depositId } = parsed.data;
    
    // Get deposit with user info
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
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
    
    if (!deposit) {
      return NextResponse.json({ 
        ok: false, 
        error: "Deposit not found" 
      }, { status: 404 });
    }
    
    if (deposit.status !== 'PENDING') {
      return NextResponse.json({ 
        ok: false, 
        error: "Deposit is not pending" 
      }, { status: 400 });
    }
    
    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update deposit status
      await tx.deposit.update({
        where: { id: depositId },
        data: { 
          status: 'APPROVED',
          updatedAt: new Date()
        }
      });
      
      // Update user balance
      await tx.user.update({
        where: { id: deposit.userId },
        data: {
          balance: {
            increment: deposit.amount
          },
          updatedAt: new Date()
        }
      });
    });
    
    console.log(`Admin ${session.user.email} approved deposit ${depositId} for user ${deposit.user.email}`);
    
    return NextResponse.json({
      ok: true,
      message: 'Deposit approved successfully'
    });
    
  } catch (error) {
    console.error('Error approving deposit:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to approve deposit'
    }, { status: 500 });
  }
}
