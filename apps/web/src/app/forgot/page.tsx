'use client';

import { useState } from "react";
import Link from "next/link";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setIsLoading(true);
    
    try {
      const r = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json();
      
      if (j.ok) {
        setMsg("If an account with that email exists, we've sent a password reset link.");
        if (j.devToken) {
          setMsg(`Dev mode: Reset link is http://localhost:3001/reset?token=${j.devToken}&email=${encodeURIComponent(email)}`);
        }
      } else {
        setMsg("An error occurred. Please try again.");
      }
    } catch {
      setMsg("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 12 }}>Forgot Password</h1>
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
        {msg && (
          <div style={{ 
            color: msg.includes("Dev mode") ? "blue" : "green", 
            padding: 12, 
            backgroundColor: "#f0f0f0",
            borderRadius: 4 
          }}>
            {msg}
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login">Back to Login</Link>
          <Link href="/register">Create Account</Link>
        </div>
      </form>
    </main>
  );
}
