import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RejectDepositSchema = z.object({
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
    const parsed = RejectDepositSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { depositId } = parsed.data;
    
    // Get deposit
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        user: {
          select: {
            id: true,
            email: true
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
    
    // Update deposit status
    await prisma.deposit.update({
      where: { id: depositId },
      data: { 
        status: 'REJECTED',
        updatedAt: new Date()
      }
    });
    
    console.log(`Admin ${session.user.email} rejected deposit ${depositId} for user ${deposit.user.email}`);
    
    return NextResponse.json({
      ok: true,
      message: 'Deposit rejected successfully'
    });
    
  } catch (error) {
    console.error('Error rejecting deposit:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to reject deposit'
    }, { status: 500 });
  }
}
