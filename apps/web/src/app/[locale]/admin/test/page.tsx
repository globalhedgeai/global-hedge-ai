"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  };
  ok?: boolean;
}

export default function AdminTestPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      console.log('Session check result:', data);
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Test Page</h1>
          <p className="text-gray-300 text-lg">Testing admin functionality</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Session Status</h2>
          <pre className="bg-gray-700 p-4 rounded-lg overflow-auto text-sm text-gray-300">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={testLogin}
              className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
            >
              Test Login
            </button>
            <button
              onClick={checkSession}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors ml-4"
            >
              Check Session
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Admin Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/en/admin" className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors text-center">
              Admin Dashboard
            </Link>
            <Link href="/en/admin/users" className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors text-center">
              Users Management
            </Link>
            <Link href="/en/admin/wallet" className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors text-center">
              Wallet Management
            </Link>
            <Link href="/en/admin/messages" className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors text-center">
              Messages
            </Link>
            <Link href="/en/admin/reports" className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors text-center">
              Reports
            </Link>
            <Link href="/en/admin/full-control" className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors text-center">
              Full Control
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}