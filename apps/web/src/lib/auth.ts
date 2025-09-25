import { redirect } from "next/navigation";
import { getSession } from "./session";
import { NextResponse } from "next/server";

export async function getSessionUser() {
  const session = await getSession();
  return session.user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireUserApi() {
  const devOpen = process.env.AUTH_DEV_OPEN === '1';
  
  if (devOpen) {
    return { id: 'dev-bypass', email: 'dev@example.com', role: 'USER' };
  }

  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    return user;
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}