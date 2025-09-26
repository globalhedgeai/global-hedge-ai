import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { passwordSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/password';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Parse JSON body and accept any of the specified formats
    const token = body.token || body.devToken || body.resetToken;
    const password = body.password || body.newPassword;
    
    // Validate inputs
    if (!token) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    
    if (!password || !passwordSchema.safeParse(password).success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    
    // Hash the provided token using SHA-256 hex
    const tokenHash = createHash('sha256').update(token).digest('hex');
    
    // Look up PasswordResetToken where tokenHash matches, not used, and not expired
    const resetToken = await prisma.passwordResetToken.findUnique({ 
      where: { tokenHash } 
    });
    
    // Guard: expiresAt > new Date() and usedAt is null
    if (!resetToken || resetToken.expiresAt <= new Date() || resetToken.usedAt !== null) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    
    // Update user password: bcrypt.hash(password, 10) into User.passwordHash
    await prisma.user.update({ 
      where: { id: resetToken.userId }, 
      data: { passwordHash: await hashPassword(password) } 
    });
    
    // Mark token used: set usedAt = now
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    });
    
    // Optionally delete other tokens for that user
    await prisma.passwordResetToken.deleteMany({ 
      where: { 
        userId: resetToken.userId,
        usedAt: null
      } 
    });
    
    // Return 200 { ok:true }
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

