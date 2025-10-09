import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    // Get all transactions for the user
    const deposits = await prisma.deposit.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        amount: true,
        txId: true,
        cryptocurrency: true,
        status: true,
        createdAt: true,
        rewardAmount: true
      }
    });

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        amount: true,
        txId: true,
        cryptocurrency: true,
        status: true,
        createdAt: true
      }
    });

    const dailyRewards = await prisma.dailyRewardClaim.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        amount: true,
        claimedAt: true
      }
    });

    const randomRewards = await prisma.randomRewardClaim.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        amount: true,
        claimedAt: true
      }
    });

    // Combine all transactions
    const transactions = [
      ...deposits.map(d => ({
        id: d.id,
        type: 'deposit' as const,
        amount: d.amount.toNumber(),
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        txId: d.txId,
        network: d.cryptocurrency,
        rewardAmount: d.rewardAmount?.toNumber()
      })),
      ...withdrawals.map(w => ({
        id: w.id,
        type: 'withdrawal' as const,
        amount: w.amount.toNumber(),
        status: w.status,
        createdAt: w.createdAt.toISOString(),
        txId: w.txId,
        network: w.cryptocurrency
      })),
      ...dailyRewards.map(r => ({
        id: r.id,
        type: 'daily_reward' as const,
        amount: r.amount.toNumber(),
        status: 'completed',
        createdAt: r.claimedAt.toISOString()
      })),
      ...randomRewards.map(r => ({
        id: r.id,
        type: 'random_reward' as const,
        amount: r.amount.toNumber(),
        status: 'completed',
        createdAt: r.claimedAt.toISOString()
      }))
    ];

    // Sort by creation date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ ok: true, transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
