import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    const { userId } = await params;
    const { balance } = await req.json();
    
    // Check if user is admin
    if (!session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Validate balance
    if (typeof balance !== 'number' || balance < 0) {
      return NextResponse.json({ ok: false, error: 'Invalid balance' }, { status: 400 });
    }

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance },
      select: {
        id: true,
        email: true,
        balance: true,
        role: true,
        createdAt: true,
        firstDepositAt: true,
        lastWithdrawalAt: true,
      }
    });

    // Log the change in audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        entityType: 'User',
        entityId: userId,
        action: 'UPDATE_BALANCE',
        before: JSON.stringify({ balance: 'previous_value' }),
        after: JSON.stringify({ balance }),
        reason: 'Admin balance adjustment'
      }
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user balance:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update balance' },
      { status: 500 }
    );
  }
}
