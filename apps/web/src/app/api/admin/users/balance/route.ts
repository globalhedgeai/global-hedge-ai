import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateBalanceSchema = z.object({
  userId: z.string().min(1),
  balance: z.number().min(0)
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
    }
    
    const body = await req.json();
    const parsed = UpdateBalanceSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { userId, balance } = parsed.data;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        error: "User not found" 
      }, { status: 404 });
    }
    
    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        balance,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        balance: true,
        updatedAt: true
      }
    });
    
    console.log(`Admin ${session.user.email} updated user ${user.email} balance to ${balance}`);
    
    return NextResponse.json({
      ok: true,
      user: updatedUser,
      message: `User balance updated to ${balance}`
    });
    
  } catch (error) {
    console.error('Error updating user balance:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to update user balance'
    }, { status: 500 });
  }
}
