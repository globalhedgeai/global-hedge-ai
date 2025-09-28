import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ReferralTierService } from '@/lib/referralTierService';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ depositId: string }> }
) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    const { depositId } = await params;
    const { status, reviewedBy } = await req.json();
    
    // Check if user is admin
    if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT')) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Validate input
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    }

    // Get current deposit to check if status is changing
    const currentDeposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      select: { status: true, userId: true }
    });

    if (!currentDeposit) {
      return NextResponse.json({ ok: false, error: 'Deposit not found' }, { status: 404 });
    }

    // Update deposit status
    const updatedDeposit = await prisma.deposit.update({
      where: { id: depositId },
      data: {
        status: status as 'APPROVED' | 'REJECTED',
        reviewedBy: reviewedBy || session.user.id,
        reviewedAt: new Date(),
        effectiveAt: status === 'APPROVED' ? new Date() : null
      },
      include: {
        user: {
          select: { id: true, email: true, firstDepositAt: true }
        }
      }
    });

    // If deposit was approved and this is a status change, handle referral tier update
    if (status === 'APPROVED' && currentDeposit.status !== 'APPROVED') {
      await ReferralTierService.handleDepositApproval(depositId);
      
      // Update user balance if deposit was approved
      await prisma.user.update({
        where: { id: currentDeposit.userId },
        data: {
          balance: {
            increment: updatedDeposit.amount
          },
          firstDepositAt: updatedDeposit.user.firstDepositAt || new Date()
        }
      });
    }

    // Log the change in audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        entityType: 'Deposit',
        entityId: depositId,
        action: 'STATUS_CHANGE',
        before: JSON.stringify({ status: currentDeposit.status }),
        after: JSON.stringify({ status }),
        reason: `Admin ${status.toLowerCase()} deposit`
      }
    });

    return NextResponse.json({
      ok: true,
      deposit: {
        id: updatedDeposit.id,
        status: updatedDeposit.status,
        reviewedBy: updatedDeposit.reviewedBy,
        reviewedAt: updatedDeposit.reviewedAt,
        effectiveAt: updatedDeposit.effectiveAt
      }
    });

  } catch (error) {
    console.error('Error updating deposit status:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update deposit status' },
      { status: 500 }
    );
  }
}
