import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { RandomRewardService } from '@/lib/RandomRewardService';
import { Decimal } from '@prisma/client/runtime/library';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

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
    let network: string;
    let proofImageUrl: string | undefined;

    // Try multipart first, fallback to JSON on failure or when content-type is application/json
    try {
      if (!contentType.includes('application/json')) {
        // Handle multipart/form-data
        const formData = await req.formData();
        const amountStr = formData.get('amount')?.toString();
        const txIdStr = formData.get('txId')?.toString();
        const networkStr = formData.get('network')?.toString();
        const file = formData.get('proof') as File | null;

        if (!amountStr || !txIdStr || !file) {
          return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
        }

        amount = parseFloat(amountStr);
        if (isNaN(amount)) {
          return NextResponse.json({ ok: false, error: 'invalid amount' }, { status: 400 });
        }

        txId = txIdStr;
        network = networkStr || 'TRC20';

        // Save file
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        
        const origName = file.name || 'proof';
        const safeName = origName.replace(/[^\w.\-()\s]/g, '').trim() || 'proof';
        const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`;
        const absPath = path.join(UPLOAD_DIR, fileName);

        const buf = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(absPath, buf);

        proofImageUrl = `/uploads/${fileName}`;
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
      network = json.network || 'TRC20';

      // Handle optional proofBase64
      if (json.proofBase64) {
        try {
          await fs.mkdir(UPLOAD_DIR, { recursive: true });
          
          const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}-proof.png`;
          const absPath = path.join(UPLOAD_DIR, fileName);
          
          const buf = Buffer.from(json.proofBase64, 'base64');
          await fs.writeFile(absPath, buf);
          
          proofImageUrl = `/uploads/${fileName}`;
        } catch (fileError) {
          // Continue without proofImageUrl if file save fails
          console.warn('Failed to save proofBase64:', fileError);
        }
      }
    }

    const toAddress = process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? 'TKaAamEouHjG9nZwoTPhgYUerejbBHGMop';

    // Calculate random reward
    const rewardPolicies = {
      enabled: false, // Default disabled
      chancePct: 5,
      bonusPct: 2
    };
    
    const rewardResult = RandomRewardService.calculateReward(
      new Decimal(amount),
      rewardPolicies
    );

    const created = await prisma.deposit.create({
      data: {
        amount,
        txId,
        proofImageUrl: proofImageUrl || '',
        network,
        toAddress,
        status: 'PENDING',
        rewardAmount: rewardResult.rewardAmount,
        rewardMeta: JSON.stringify(rewardResult.rewardMeta),
        user: { connect: { id: session.user.id } },
      },
    });

    return NextResponse.json({ 
      ok: true, 
      id: created.id, 
      proofImageUrl,
      rewardAmount: rewardResult.rewardAmount.toNumber()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}