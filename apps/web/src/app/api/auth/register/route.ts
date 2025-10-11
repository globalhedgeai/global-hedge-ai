import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/password';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';

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
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }
    
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
    }

    const { email, password, referralCode } = parsed.data;
    
    // Check if user already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ ok: false, error: 'email_taken' }, { status: 400 });

    let invitedById: string | undefined = undefined;

    // Handle referral code if provided
    if (referralCode) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode: referralCode }
      });

      if (referrer) {
        invitedById = referrer.id;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash: await hashPassword(password), 
        role: 'USER', 
        referralCode: await generateUniqueReferralCode(),
        invitedById
      },
    });

    // Update referral stats if user was invited
    if (invitedById) {
      try {
        await prisma.referralStats.upsert({
          where: { userId: invitedById },
          update: { 
            invitedCount: { increment: 1 }
          },
          create: {
            userId: invitedById,
            invitedCount: 1,
            tier: 1
          }
        });
      } catch (error) {
        console.error('Error updating referral stats:', error);
        // Continue without failing the registration
      }
    }

    // Create session
    const res = NextResponse.json({ ok: true });
    const session = await getIronSession(req, res, sessionOptions) as IronSession;
    session.user = { id: user.id, email: user.email, role: user.role };
    await session.save();
    return res;
    
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      ok: false, 
      error: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}