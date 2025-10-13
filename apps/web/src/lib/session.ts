import { SessionOptions, getIronSession } from 'iron-session';
import type { Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  balance?: number;
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionUser;
  }
}

export interface IronSession {
  user?: SessionUser;
  save(): Promise<void>;
  destroy(): Promise<void>;
}

export const sessionOptions: SessionOptions = {
  cookieName: 'session',
  password: process.env.SESSION_SECRET || 'GlobalHedge2024!@#SecureSessionKey!@#2024VeryLongSecretKeyForProductionUse',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
};

export async function getServerSession(req: NextRequest): Promise<IronSession | null> {
  try {
    const res = NextResponse.next();
    const session = await getIronSession(req, res, sessionOptions);
    return session as IronSession;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}