import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions);
    
    if (!session.user || !['ADMIN', 'ACCOUNTING'].includes(session.user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all wallet address policies
    const addresses = await prisma.policy.findMany({
      where: {
        key: {
          endsWith: '_ADDRESS'
        }
      },
      orderBy: {
        key: 'asc'
      }
    });

    return NextResponse.json({ ok: true, addresses });
  } catch (error) {
    console.error('Error fetching wallet addresses:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions);
    
    if (!session.user || !['ADMIN', 'ACCOUNTING'].includes(session.user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value } = await req.json();

    if (!key || !value) {
      return NextResponse.json({ ok: false, error: 'Key and value are required' }, { status: 400 });
    }

    // Validate that the key ends with _ADDRESS
    if (!key.endsWith('_ADDRESS')) {
      return NextResponse.json({ ok: false, error: 'Invalid key format' }, { status: 400 });
    }

    // Validate wallet address format based on the cryptocurrency type
    const cryptoType = key.replace('_ADDRESS', '');
    if (!isValidWalletAddress(value, cryptoType)) {
      return NextResponse.json({ ok: false, error: 'Invalid wallet address format' }, { status: 400 });
    }

    // Get the old value for audit logging
    const oldPolicy = await prisma.policy.findUnique({
      where: { key }
    });

    // Update or create the policy
    const policy = await prisma.policy.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    // Log the change in audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        entityType: 'WALLET_ADDRESS',
        entityId: key,
        action: oldPolicy ? 'UPDATE' : 'CREATE',
        before: oldPolicy?.value || null,
        after: value,
        reason: 'Admin wallet address update'
      }
    });

    return NextResponse.json({ ok: true, policy });
  } catch (error) {
    console.error('Error updating wallet address:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

function isValidWalletAddress(address: string, cryptoType: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  const trimmedAddress = address.trim();
  if (trimmedAddress.length === 0) return false;

  switch (cryptoType) {
    case 'USDT_TRC20':
      // TRC20 addresses start with 'T' and are 34 characters long
      return /^T[A-Za-z1-9]{33}$/.test(trimmedAddress);
    
    case 'USDT_ERC20':
    case 'ETH':
    case 'MATIC':
    case 'AVAX':
      // Ethereum-style addresses start with '0x' and are 42 characters long
      return /^0x[a-fA-F0-9]{40}$/.test(trimmedAddress);
    
    case 'BTC':
      // Bitcoin addresses can be different formats (legacy, segwit, bech32)
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(trimmedAddress);
    
    case 'BNB':
      // BNB addresses start with 'bnb' and are 42 characters long
      return /^bnb[a-z0-9]{39}$/.test(trimmedAddress);
    
    case 'ADA':
      // Cardano addresses start with 'addr1' and are longer
      return /^addr1[a-z0-9]+$/.test(trimmedAddress);
    
    case 'SOL':
      // Solana addresses are base58 encoded and typically 32-44 characters
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedAddress);
    
    case 'DOT':
      // Polkadot addresses start with '1' and are typically 47-48 characters
      return /^1[a-zA-Z0-9]{46,47}$/.test(trimmedAddress);
    
    default:
      // For unknown types, just check it's not empty and reasonable length
      return trimmedAddress.length >= 10 && trimmedAddress.length <= 100;
  }
}
