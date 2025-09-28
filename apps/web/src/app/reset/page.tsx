'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Pre-fill from URL params if available
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    if (urlToken) setToken(urlToken);
    if (urlEmail) setEmail(urlEmail);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setIsLoading(true);
    
    try {
      const r = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const j = await r.json();
      
      if (j.ok) {
        setMsg("Password reset successfully! You can now login with your new password.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMsg("Invalid or expired reset token. Please request a new reset link.");
      }
    } catch {
      setMsg("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 12 }}>Reset Password</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>Email
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={isLoading}
          />
        </label>
        <label>Reset Token
          <input 
            type="text" 
            value={token} 
            onChange={e => setToken(e.target.value)} 
            required 
            disabled={isLoading}
            placeholder="Enter the token from your email"
          />
        </label>
        <label>New Password
          <input 
            type="password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            required 
            minLength={8}
            disabled={isLoading}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
        {msg && (
          <div style={{ 
            color: msg.includes("successfully") ? "green" : "red", 
            padding: 12, 
            backgroundColor: "#f0f0f0",
            borderRadius: 4 
          }}>
            {msg}
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login">Back to Login</Link>
          <Link href="/forgot">Request New Reset Link</Link>
        </div>
      </form>
    </main>
  );
}
