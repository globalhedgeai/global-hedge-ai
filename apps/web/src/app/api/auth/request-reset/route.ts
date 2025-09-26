import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';


export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ ok: true }); // Don't reveal if email exists
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    // Invalidate previous tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    
    // Generate a random secure token (32 bytes hex), store SHA-256 hash in DB
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
    
    // Create nodemailer transporter with JSON transport for dev
    const transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    
    const resetUrl = `http://localhost:3001/reset?token=${token}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: 'noreply@global-hedge-ai.com',
      to: email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetUrl}`,
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.message);
    } catch (error) {
      console.error('Email error:', error);
    }
    
    // If process.env.NODE_ENV !== 'production' then include { devToken: token } in the JSON
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ ok: true, devToken: token });
    }
  }
  
  // Always return 200 { ok:true, [devToken] }
  return NextResponse.json({ ok: true });
}
