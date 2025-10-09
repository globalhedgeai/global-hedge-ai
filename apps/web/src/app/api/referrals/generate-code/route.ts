import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

async function generateUniqueReferralCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists
    const existing = await prisma.user.findFirst({
      where: { referralCode: result }
    });
    
    if (!existing) {
      return result;
    }
    
    attempts++;
  }
  
  // Fallback with timestamp if all attempts fail
  return 'REF' + Date.now().toString().slice(-5);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    if (!session.user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Check if user already has a referral code
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true }
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
    }

    if (user.referralCode) {
      return NextResponse.json({ 
        ok: true, 
        referralCode: user.referralCode,
        message: 'User already has a referral code'
      });
    }

    // Generate new referral code
    const newReferralCode = await generateUniqueReferralCode();

    // Update user with new referral code
    await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode: newReferralCode }
    });

    return NextResponse.json({
      ok: true,
      referralCode: newReferralCode,
      message: 'Referral code generated successfully'
    });

  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to generate referral code' },
      { status: 500 }
    );
  }
}
