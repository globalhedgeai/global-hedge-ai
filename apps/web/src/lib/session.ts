import { SessionOptions } from 'iron-session';
import type { Role } from '@prisma/client';

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
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
  password: process.env.SESSION_SECRET || 'dev-secret-change-me-please-32+chars',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
};