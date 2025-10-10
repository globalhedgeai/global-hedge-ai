import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const FullUserUpdateSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['USER', 'ADMIN', 'SUPPORT', 'ACCOUNTING']),
  balance: z.number(),
  referralCode: z.string().min(1),
  walletAddress: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  firstDepositAt: z.string().optional(),
  lastWithdrawalAt: z.string().optional(),
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
    const parsed = FullUserUpdateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request body",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { 
      id, 
      email, 
      role, 
      balance, 
      referralCode, 
      walletAddress, 
      createdAt, 
      updatedAt, 
      firstDepositAt, 
      lastWithdrawalAt 
    } = parsed.data;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }
    
    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        return NextResponse.json({ ok: false, error: "Email already exists" }, { status: 400 });
      }
    }
    
    // Check if referral code is already taken by another user
    if (referralCode !== existingUser.referralCode) {
      const referralExists = await prisma.user.findUnique({
        where: { referralCode }
      });
      
      if (referralExists) {
        return NextResponse.json({ ok: false, error: "Referral code already exists" }, { status: 400 });
      }
    }
    
    // Update user with all fields
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        role,
        balance,
        referralCode,
        walletAddress: walletAddress || null,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        firstDepositAt: firstDepositAt ? new Date(firstDepositAt) : null,
        lastWithdrawalAt: lastWithdrawalAt ? new Date(lastWithdrawalAt) : null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        referralCode: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true,
        firstDepositAt: true,
        lastWithdrawalAt: true,
      }
    });
    
    console.log(`Admin ${session.user.email} updated user ${email} with full control`);
    
    return NextResponse.json({
      ok: true,
      user: {
        ...updatedUser,
        balance: updatedUser.balance.toNumber(),
      }
    });
    
  } catch (error) {
    console.error('Error updating user with full control:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}
