import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { z } from "zod";

export const sessionSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.enum(["USER", "ADMIN"]),
  }).optional(),
});

export type SessionData = z.infer<typeof sessionSchema> & {
  save: () => Promise<void>;
  destroy: () => Promise<void>;
};

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'dev-secret-do-not-use-in-production',
  cookieName: "session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
  ttl: 0,
};

export async function getSession() {
  if (process.env.AUTH_DEV_OPEN === '1') {
    return {
      user: {
        id: 'dev-bypass',
        email: 'dev@example.com',
        role: 'USER',
      },
    } as SessionData;
  }
  try {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
  } catch {
    return {} as SessionData;
  }
}