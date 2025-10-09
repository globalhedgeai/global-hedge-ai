import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { z } from 'zod';

const updateStatsSchema = z.object({
  totalUsers: z.number().min(0).optional(),
  totalVolume: z.number().min(0).optional(),
  activeTrades: z.number().min(0).optional(),
  totalDeposits: z.number().min(0).optional(),
  totalWithdrawals: z.number().min(0).optional(),
});

export async function GET() {
  try {
    const stats = await prisma.platformStats.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!stats) {
      // إنشاء إحصائيات افتراضية إذا لم تكن موجودة
      const defaultStats = await prisma.platformStats.create({
        data: {
          totalUsers: 1000,
          totalVolume: 5000000,
          activeTrades: 150,
          totalDeposits: 3000000,
          totalWithdrawals: 2000000,
        }
      });
      return NextResponse.json(defaultStats);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform stats' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateStatsSchema.parse(body);

    // الحصول على أحدث إحصائيات
    const currentStats = await prisma.platformStats.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!currentStats) {
      // إنشاء إحصائيات جديدة إذا لم تكن موجودة
      const newStats = await prisma.platformStats.create({
        data: {
          totalUsers: validatedData.totalUsers ?? 1000,
          totalVolume: validatedData.totalVolume ?? 5000000,
          activeTrades: validatedData.activeTrades ?? 150,
          totalDeposits: validatedData.totalDeposits ?? 3000000,
          totalWithdrawals: validatedData.totalWithdrawals ?? 2000000,
        }
      });
      return NextResponse.json(newStats);
    }

    // تحديث الإحصائيات الموجودة
    const updatedStats = await prisma.platformStats.update({
      where: { id: currentStats.id },
      data: {
        totalUsers: validatedData.totalUsers ?? currentStats.totalUsers,
        totalVolume: validatedData.totalVolume ?? currentStats.totalVolume,
        activeTrades: validatedData.activeTrades ?? currentStats.activeTrades,
        totalDeposits: validatedData.totalDeposits ?? currentStats.totalDeposits,
        totalWithdrawals: validatedData.totalWithdrawals ?? currentStats.totalWithdrawals,
      }
    });

    return NextResponse.json(updatedStats);
  } catch (error) {
    console.error('Error updating platform stats:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update platform stats' },
      { status: 500 }
    );
  }
}
