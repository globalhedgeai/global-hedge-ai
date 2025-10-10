import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['USER', 'ADMIN', 'SUPPORT', 'ACCOUNTING'])
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
    const parsed = UpdateRoleSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid request data",
        details: parsed.error.errors
      }, { status: 400 });
    }
    
    const { userId, role } = parsed.data;
    
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
    
    // Prevent admin from changing their own role
    if (userId === session.user.id) {
      return NextResponse.json({ 
        ok: false, 
        error: "Cannot change your own role" 
      }, { status: 400 });
    }
    
    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });
    
    console.log(`Admin ${session.user.email} changed user ${user.email} role to ${role}`);
    
    return NextResponse.json({
      ok: true,
      user: updatedUser,
      message: `User role updated to ${role}`
    });
    
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to update user role'
    }, { status: 500 });
  }
}
