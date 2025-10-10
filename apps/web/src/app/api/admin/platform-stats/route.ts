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
    
    // Get platform statistics
    const [
      totalUsers,
      totalDeposits,
      totalWithdrawals,
      pendingDeposits,
      pendingWithdrawals,
      totalBalance
    ] = await Promise.all([
      prisma.user.count(),
      prisma.deposit.aggregate({
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.withdrawal.aggregate({
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.deposit.count({
        where: { status: 'PENDING' }
      }),
      prisma.withdrawal.count({
        where: { status: 'PENDING' }
      }),
      prisma.user.aggregate({
        _sum: { balance: true }
      })
    ]);
    
    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    const recentDeposits = await prisma.deposit.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    const recentWithdrawals = await prisma.withdrawal.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    const stats = {
      overview: {
        totalUsers,
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        pendingDeposits,
        pendingWithdrawals,
        totalBalance: totalBalance._sum.balance || 0,
        totalDepositCount: totalDeposits._count.id || 0,
        totalWithdrawalCount: totalWithdrawals._count.id || 0
      },
      recentActivity: {
        users: recentUsers,
        deposits: recentDeposits,
        withdrawals: recentWithdrawals
      }
    };
    
    return NextResponse.json({
      ok: true,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch platform stats'
    }, { status: 500 });
  }
}