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
    
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'monthly';
    const startDate = url.searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get('end') || new Date().toISOString();
    
    // Get financial data based on period
    const reports = [];
    
    if (period === 'daily') {
      // Generate daily reports
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayStart = new Date(date);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const [deposits, withdrawals, rewards, users, transactions] = await Promise.all([
          prisma.deposit.aggregate({
            where: {
              createdAt: { gte: dayStart, lte: dayEnd },
              status: 'APPROVED'
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.withdrawal.aggregate({
            where: {
              createdAt: { gte: dayStart, lte: dayEnd },
              status: 'APPROVED'
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.dailyRewardClaim.aggregate({
            where: {
              claimedAt: { gte: dayStart, lte: dayEnd }
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.user.count({
            where: {
              createdAt: { gte: dayStart, lte: dayEnd }
            }
          }),
          Promise.all([
            prisma.deposit.count({
              where: {
                createdAt: { gte: dayStart, lte: dayEnd }
              }
            }),
            prisma.withdrawal.count({
              where: {
                createdAt: { gte: dayStart, lte: dayEnd }
              }
            })
          ]).then(([depositCount, withdrawalCount]) => depositCount + withdrawalCount)
        ]);
        
        reports.push({
          period: date.toLocaleDateString(),
          totalDeposits: Number(deposits._sum.amount || 0),
          totalWithdrawals: Number(withdrawals._sum.amount || 0),
          totalRewards: Number(rewards._sum.amount || 0),
          netProfit: Number(deposits._sum.amount || 0) - Number(withdrawals._sum.amount || 0) - Number(rewards._sum.amount || 0),
          userCount: users,
          transactionCount: transactions
        });
      }
    } else if (period === 'weekly') {
      // Generate weekly reports
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 7)) {
        const weekStart = new Date(date);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const [deposits, withdrawals, rewards, users, transactions] = await Promise.all([
          prisma.deposit.aggregate({
            where: {
              createdAt: { gte: weekStart, lte: weekEnd },
              status: 'APPROVED'
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.withdrawal.aggregate({
            where: {
              createdAt: { gte: weekStart, lte: weekEnd },
              status: 'APPROVED'
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.dailyRewardClaim.aggregate({
            where: {
              claimedAt: { gte: weekStart, lte: weekEnd }
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.user.count({
            where: {
              createdAt: { gte: weekStart, lte: weekEnd }
            }
          }),
          Promise.all([
            prisma.deposit.count({
              where: {
                createdAt: { gte: weekStart, lte: weekEnd }
              }
            }),
            prisma.withdrawal.count({
              where: {
                createdAt: { gte: weekStart, lte: weekEnd }
              }
            })
          ]).then(([depositCount, withdrawalCount]) => depositCount + withdrawalCount)
        ]);
        
        reports.push({
          period: `Week of ${weekStart.toLocaleDateString()}`,
          totalDeposits: Number(deposits._sum.amount || 0),
          totalWithdrawals: Number(withdrawals._sum.amount || 0),
          totalRewards: Number(rewards._sum.amount || 0),
          netProfit: Number(deposits._sum.amount || 0) - Number(withdrawals._sum.amount || 0) - Number(rewards._sum.amount || 0),
          userCount: users,
          transactionCount: transactions
        });
      }
    } else if (period === 'monthly') {
      // Generate monthly reports
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setMonth(date.getMonth() + 1)) {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const [deposits, withdrawals, rewards, users, transactions] = await Promise.all([
          prisma.deposit.aggregate({
            where: {
              createdAt: { gte: monthStart, lte: monthEnd },
              status: 'APPROVED'
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.withdrawal.aggregate({
            where: {
              createdAt: { gte: monthStart, lte: monthEnd },
              status: 'APPROVED'
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.dailyRewardClaim.aggregate({
            where: {
              claimedAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.user.count({
            where: {
              createdAt: { gte: monthStart, lte: monthEnd }
            }
          }),
          Promise.all([
            prisma.deposit.count({
              where: {
                createdAt: { gte: monthStart, lte: monthEnd }
              }
            }),
            prisma.withdrawal.count({
              where: {
                createdAt: { gte: monthStart, lte: monthEnd }
              }
            })
          ]).then(([depositCount, withdrawalCount]) => depositCount + withdrawalCount)
        ]);
        
        reports.push({
          period: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          totalDeposits: Number(deposits._sum.amount || 0),
          totalWithdrawals: Number(withdrawals._sum.amount || 0),
          totalRewards: Number(rewards._sum.amount || 0),
          netProfit: Number(deposits._sum.amount || 0) - Number(withdrawals._sum.amount || 0) - Number(rewards._sum.amount || 0),
          userCount: users,
          transactionCount: transactions
        });
      }
    } else if (period === 'yearly') {
      // Generate yearly reports
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setFullYear(date.getFullYear() + 1)) {
        const yearStart = new Date(date.getFullYear(), 0, 1);
        const yearEnd = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
        
        const [deposits, withdrawals, rewards, users, transactions] = await Promise.all([
          prisma.deposit.aggregate({
            where: {
              createdAt: { gte: yearStart, lte: yearEnd },
              status: 'APPROVED'
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.withdrawal.aggregate({
            where: {
              createdAt: { gte: yearStart, lte: yearEnd },
              status: 'APPROVED'
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.dailyRewardClaim.aggregate({
            where: {
              claimedAt: { gte: yearStart, lte: yearEnd }
            },
            _sum: { amount: true },
            _count: { id: true }
          }),
          prisma.user.count({
            where: {
              createdAt: { gte: yearStart, lte: yearEnd }
            }
          }),
          Promise.all([
            prisma.deposit.count({
              where: {
                createdAt: { gte: yearStart, lte: yearEnd }
              }
            }),
            prisma.withdrawal.count({
              where: {
                createdAt: { gte: yearStart, lte: yearEnd }
              }
            })
          ]).then(([depositCount, withdrawalCount]) => depositCount + withdrawalCount)
        ]);
        
        reports.push({
          period: yearStart.getFullYear().toString(),
          totalDeposits: Number(deposits._sum.amount || 0),
          totalWithdrawals: Number(withdrawals._sum.amount || 0),
          totalRewards: Number(rewards._sum.amount || 0),
          netProfit: Number(deposits._sum.amount || 0) - Number(withdrawals._sum.amount || 0) - Number(rewards._sum.amount || 0),
          userCount: users,
          transactionCount: transactions
        });
      }
    }
    
    return NextResponse.json({
      ok: true,
      reports,
      period,
      startDate,
      endDate,
      count: reports.length
    });
    
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch financial reports'
    }, { status: 500 });
  }
}
