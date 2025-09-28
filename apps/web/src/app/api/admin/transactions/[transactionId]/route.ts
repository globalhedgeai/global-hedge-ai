import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    const { transactionId } = await params;
    const { type, effectiveAt } = await req.json();
    
    // Check if user is admin
    if (!session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Validate input
    if (!type || !effectiveAt || !['deposit', 'withdrawal'].includes(type)) {
      return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 });
    }

    const effectiveDate = new Date(effectiveAt);
    if (isNaN(effectiveDate.getTime())) {
      return NextResponse.json({ ok: false, error: 'Invalid date' }, { status: 400 });
    }

    let updatedTransaction;

    if (type === 'deposit') {
      updatedTransaction = await prisma.deposit.update({
        where: { id: transactionId },
        data: { effectiveAt: effectiveDate },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          effectiveAt: true,
        }
      });
    } else {
      updatedTransaction = await prisma.withdrawal.update({
        where: { id: transactionId },
        data: { effectiveAt: effectiveDate },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          effectiveAt: true,
        }
      });
    }

    // Log the change in audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        entityType: type === 'deposit' ? 'Deposit' : 'Withdrawal',
        entityId: transactionId,
        action: 'UPDATE_DATE',
        before: JSON.stringify({ effectiveAt: 'previous_value' }),
        after: JSON.stringify({ effectiveAt }),
        reason: 'Admin date adjustment'
      }
    });

    return NextResponse.json({
      ok: true,
      transaction: updatedTransaction
    });

  } catch (error) {
    console.error('Error updating transaction date:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update transaction date' },
      { status: 500 }
    );
  }
}
