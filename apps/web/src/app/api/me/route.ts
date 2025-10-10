import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        referralCode: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        balance: user.balance,
        referralCode: user.referralCode,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch user data'
    }, { status: 500 });
  }
}