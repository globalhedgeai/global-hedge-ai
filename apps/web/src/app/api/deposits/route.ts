import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { RandomRewardService } from '@/lib/RandomRewardService';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const items = await prisma.deposit.findMany({ 
    where: { userId: session.user.id }, 
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const contentType = req.headers.get('content-type') || '';
    
    let amount: number;
    let txId: string;
    let cryptocurrency: string;
    let proofImageUrl: string | undefined;

    // Try multipart first, fallback to JSON on failure or when content-type is application/json
    try {
      if (!contentType.includes('application/json')) {
        // Handle multipart/form-data
        const formData = await req.formData();
        const amountStr = formData.get('amount')?.toString();
        const txIdStr = formData.get('txId')?.toString();
        const cryptocurrencyStr = formData.get('cryptocurrency')?.toString();
        const proofImageUrlStr = formData.get('proofImageUrl')?.toString();

        if (!amountStr || !txIdStr) {
          return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
        }

        amount = parseFloat(amountStr);
        if (isNaN(amount)) {
          return NextResponse.json({ ok: false, error: 'invalid amount' }, { status: 400 });
        }

        txId = txIdStr;
        cryptocurrency = cryptocurrencyStr || 'USDT_TRC20';
        proofImageUrl = proofImageUrlStr || undefined;
      } else {
        throw new Error('Content-type is application/json, use JSON path');
      }
    } catch {
      // Fallback to JSON parsing
      const json = await req.json().catch(() => null);
      if (!json || !json.amount || !json.txId) {
        return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
      }

      amount = parseFloat(json.amount);
      if (isNaN(amount)) {
        return NextResponse.json({ ok: false, error: 'invalid amount' }, { status: 400 });
      }

      txId = json.txId;
      cryptocurrency = json.cryptocurrency || 'USDT_TRC20';
      proofImageUrl = json.proofImageUrl || undefined;
    }

    // Get company address for the selected cryptocurrency
    const companyAddress = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "TKaAamEouHjG9nZwoTPhgYUerejbBHGMop";

    // Create deposit record
    const deposit = await prisma.deposit.create({
      data: {
        userId: session.user.id,
        amount: new Decimal(amount),
        txId,
        cryptocurrency: cryptocurrency as 'USDT_TRC20' | 'USDT_ERC20' | 'BTC' | 'ETH' | 'BNB' | 'ADA' | 'SOL' | 'MATIC' | 'AVAX' | 'DOT',
        toAddress: companyAddress,
        proofImageUrl: proofImageUrl || '',
        status: 'PENDING'
      }
    });

    // Check for random reward
    let rewardAmount = 0;
    try {
      const randomRewardService = new RandomRewardService();
      const rewardResult = await randomRewardService.processDepositReward(deposit.id, amount);
      if (rewardResult.success && rewardResult.rewardAmount > 0) {
        rewardAmount = rewardResult.rewardAmount;
        
        // Update deposit with reward
        await prisma.deposit.update({
          where: { id: deposit.id },
          data: {
            rewardAmount: new Decimal(rewardAmount),
            rewardMeta: JSON.stringify(rewardResult.metadata)
          }
        });
      }
    } catch (rewardError) {
      console.error('Random reward processing failed:', rewardError);
      // Don't fail the deposit if reward processing fails
    }

    // Check if this is user's first successful deposit and update referral stats
    try {
      const userDeposits = await prisma.deposit.count({
        where: { 
          userId: session.user.id,
          status: 'APPROVED'
        }
      });

      // If this is the first approved deposit, update referrer's stats
      if (userDeposits === 1) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { invitedById: true }
        });

        if (user?.invitedById) {
          await prisma.referralStats.upsert({
            where: { userId: user.invitedById },
            update: {
              invitedCount: { increment: 1 }
            },
            create: {
              userId: user.invitedById,
              invitedCount: 1,
              tier: 1
            }
          });

          // Add commission to referrer's balance
          await prisma.user.update({
            where: { id: user.invitedById },
            data: {
              balance: { increment: amount * 0.05 }
            }
          });
        }
      }
    } catch (referralError) {
      console.error('Referral stats update failed:', referralError);
      // Don't fail the deposit if referral update fails
    }

    return NextResponse.json({ 
      ok: true, 
      depositId: deposit.id,
      rewardAmount 
    });
  } catch (error) {
    console.error('Deposit creation failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create deposit' },
      { status: 500 }
    );
  }
}