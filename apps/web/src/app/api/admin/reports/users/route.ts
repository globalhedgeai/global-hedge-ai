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
    
    // Get all users with their financial data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        balance: true,
        createdAt: true,
        deposits: {
          where: { status: 'APPROVED' },
          select: { amount: true }
        },
        withdrawals: {
          where: { status: 'APPROVED' },
          select: { amount: true }
        },
        claims: {
          select: { amount: true }
        },
        invites: {
          select: { id: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calculate totals for each user
    const userReports = users.map(user => ({
      id: user.id,
      email: user.email,
      balance: user.balance,
      totalDeposits: Number(user.deposits.reduce((sum, deposit) => sum + Number(deposit.amount), 0)),
      totalWithdrawals: Number(user.withdrawals.reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0)),
      totalRewards: Number(user.claims.reduce((sum, claim) => sum + Number(claim.amount), 0)),
      referralCount: user.invites.length,
      createdAt: user.createdAt
    }));
    
    return NextResponse.json({
      ok: true,
      users: userReports,
      count: userReports.length
    });
    
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch user reports'
    }, { status: 500 });
  }
}
