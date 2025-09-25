'use client';

import { useRouter } from "next/navigation";
import type { SessionData } from "@/lib/session";

export function AuthHeader({ user }: { user?: SessionData["user"] }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header style={{ padding: "12px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 12 }}>
      {user ? (
        <>
          <span>Hello, {user.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </>
      )}
    </header>
  );
}
