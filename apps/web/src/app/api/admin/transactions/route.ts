import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    // Get all deposits and withdrawals
    const deposits = await prisma.deposit.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Combine and format transactions
    const transactions = [
      ...deposits.map(deposit => ({
        id: deposit.id,
        type: 'DEPOSIT',
        userId: deposit.userId,
        userEmail: deposit.user.email,
        amount: deposit.amount,
        status: deposit.status,
        createdAt: deposit.createdAt,
        walletAddress: deposit.toAddress,
        transactionHash: deposit.txId
      })),
      ...withdrawals.map(withdrawal => ({
        id: withdrawal.id,
        type: 'WITHDRAWAL',
        userId: withdrawal.userId,
        userEmail: withdrawal.user.email,
        amount: withdrawal.amount,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
        walletAddress: withdrawal.toAddress,
        transactionHash: withdrawal.txId
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({
      ok: true,
      transactions,
      count: transactions.length,
      deposits: deposits.length,
      withdrawals: withdrawals.length
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch transactions'
    }, { status: 500 });
  }
}
