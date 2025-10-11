"use client";
import React, { useState, useEffect } from 'react';

export default function AdminTestPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      setSession(data);
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@globalhedgeai.com',
          password: 'Admin123!@#'
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.ok) {
        await checkSession();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Admin Test Page</h1>
          <p className="text-muted-foreground text-lg">Testing admin functionality</p>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Session Status</h2>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={testLogin}
              className="btn-primary"
            >
              Test Login
            </button>
            <button
              onClick={checkSession}
              className="btn-secondary"
            >
              Check Session
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Admin Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/en/admin" className="btn-primary text-center">
              Admin Dashboard
            </a>
            <a href="/en/admin/users" className="btn-primary text-center">
              Users Management
            </a>
            <a href="/en/admin/wallet" className="btn-primary text-center">
              Wallet Management
            </a>
            <a href="/en/admin/messages" className="btn-primary text-center">
              Messages
            </a>
            <a href="/en/admin/reports" className="btn-primary text-center">
              Reports
            </a>
            <a href="/en/admin/full-control" className="btn-primary text-center">
              Full Control
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}