import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      ok: true,
      withdrawals,
      count: withdrawals.length
    });
    
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch withdrawals'
    }, { status: 500 });
  }
}
