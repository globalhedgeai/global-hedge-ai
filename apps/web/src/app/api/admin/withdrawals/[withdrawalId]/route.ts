import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ withdrawalId: string }> }
) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    const { withdrawalId } = await params;
    const { status, reviewedBy, effectiveAt } = await req.json();
    
    // Check if user is admin
    if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT')) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Validate input
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    }

    // Get current withdrawal to check if status is changing
    const currentWithdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      select: { status: true, userId: true, amount: true, netAmount: true }
    });

    if (!currentWithdrawal) {
      return NextResponse.json({ ok: false, error: 'Withdrawal not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: {
      status: 'APPROVED' | 'REJECTED';
      reviewedBy: string;
      reviewedAt: Date;
      effectiveAt: Date | null;
    } = {
      status: status as 'APPROVED' | 'REJECTED',
      reviewedBy: reviewedBy || session.user.id,
      reviewedAt: new Date(),
      effectiveAt: null
    };

    // Handle effective date modification
    if (effectiveAt) {
      updateData.effectiveAt = new Date(effectiveAt);
    } else if (status === 'APPROVED') {
      updateData.effectiveAt = new Date();
    } else {
      updateData.effectiveAt = null;
    }

    // Update withdrawal status
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: updateData
    });

    // If withdrawal was approved and this is a status change, update user balance
    if (status === 'APPROVED' && currentWithdrawal.status !== 'APPROVED') {
      await prisma.user.update({
        where: { id: currentWithdrawal.userId },
        data: {
          balance: {
            decrement: currentWithdrawal.netAmount
          },
          lastWithdrawalAt: updateData.effectiveAt
        }
      });
    }

    // Log the change in audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        entityType: 'Withdrawal',
        entityId: withdrawalId,
        action: 'STATUS_CHANGE',
        before: JSON.stringify({ status: currentWithdrawal.status }),
        after: JSON.stringify({ status, effectiveAt: updateData.effectiveAt }),
        reason: `Admin ${status.toLowerCase()} withdrawal${effectiveAt ? ' with custom date' : ''}`
      }
    });

    return NextResponse.json({
      ok: true,
      withdrawal: {
        id: updatedWithdrawal.id,
        status: updatedWithdrawal.status,
        reviewedBy: updatedWithdrawal.reviewedBy,
        reviewedAt: updatedWithdrawal.reviewedAt,
        effectiveAt: updatedWithdrawal.effectiveAt
      }
    });

  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update withdrawal status' },
      { status: 500 }
    );
  }
}
