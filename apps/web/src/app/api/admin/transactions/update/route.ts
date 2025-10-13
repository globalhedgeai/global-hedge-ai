import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateTransactionSchema = z.object({
  transactionId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  amount: z.number().min(0),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'])
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
    const parsed = UpdateTransactionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.issues
      }, { status: 400 });
    }
    
    const { transactionId, date, time, amount, status } = parsed.data;
    
    // Parse the new date and time
    const newDateTime = new Date(`${date}T${time}`);
    
    // Try to update deposit first
    let updatedDeposit = null;
    try {
      updatedDeposit = await prisma.deposit.update({
        where: { id: transactionId },
        data: {
          amount,
          status,
          createdAt: newDateTime
        }
      });
    } catch (error) {
      // Deposit not found, try withdrawal
    }
    
    // If deposit not found, try withdrawal
    if (!updatedDeposit) {
      try {
        const updatedWithdrawal = await prisma.withdrawal.update({
          where: { id: transactionId },
          data: {
            amount,
            status,
            createdAt: newDateTime
          }
        });
        
        console.log(`Admin ${session.user.email} updated withdrawal ${transactionId}: ${amount} - ${status} - ${newDateTime}`);
        
        return NextResponse.json({
          ok: true,
          message: 'Withdrawal updated successfully',
          transaction: {
            id: updatedWithdrawal.id,
            type: 'WITHDRAWAL',
            amount: updatedWithdrawal.amount,
            status: updatedWithdrawal.status,
            createdAt: updatedWithdrawal.createdAt
          }
        });
      } catch (error) {
        return NextResponse.json({ 
          ok: false, 
          error: "Transaction not found" 
        }, { status: 404 });
      }
    }
    
    console.log(`Admin ${session.user.email} updated deposit ${transactionId}: ${amount} - ${status} - ${newDateTime}`);
    
    return NextResponse.json({
      ok: true,
      message: 'Deposit updated successfully',
      transaction: {
        id: updatedDeposit.id,
        type: 'DEPOSIT',
        amount: updatedDeposit.amount,
        status: updatedDeposit.status,
        createdAt: updatedDeposit.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to update transaction'
    }, { status: 500 });
  }
}
