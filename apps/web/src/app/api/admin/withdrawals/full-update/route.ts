import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const FullWithdrawalUpdateSchema = z.object({
  id: z.string().min(1),
  amount: z.number().positive(),
  cryptocurrency: z.string().min(1),
  walletAddress: z.string().min(1),
  txHash: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  createdAt: z.string(),
  updatedAt: z.string(),
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
    const parsed = FullWithdrawalUpdateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request body",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { 
      id, 
      amount, 
      cryptocurrency, 
      walletAddress, 
      txHash, 
      status, 
      createdAt, 
      updatedAt 
    } = parsed.data;
    
    // Check if withdrawal exists
    const existingWithdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: { user: { select: { email: true } } }
    });
    
    if (!existingWithdrawal) {
      return NextResponse.json({ ok: false, error: "Withdrawal not found" }, { status: 404 });
    }
    
    // Update withdrawal with all fields
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id },
      data: {
        amount,
        cryptocurrency,
        walletAddress,
        txHash: txHash || null,
        status,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      }
    });
    
    console.log(`Admin ${session.user.email} updated withdrawal ${id} with full control`);
    
    return NextResponse.json({
      ok: true,
      withdrawal: {
        ...updatedWithdrawal,
        amount: updatedWithdrawal.amount.toNumber(),
        userEmail: updatedWithdrawal.user.email,
      }
    });
    
  } catch (error) {
    console.error('Error updating withdrawal with full control:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to update withdrawal'
    }, { status: 500 });
  }
}
