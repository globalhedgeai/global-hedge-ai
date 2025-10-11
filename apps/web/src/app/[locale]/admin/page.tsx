"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/translations';

export default function AdminDashboardPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
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

  const handleLogin = async () => {
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
      
      if (data.ok) {
        await checkSession();
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error');
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

  if (!session?.ok || !session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
              Admin Login Required
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Please login to access the admin panel
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <button
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Login as Admin
            </button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Email: admin@globalhedgeai.com
              </p>
              <p className="text-sm text-muted-foreground">
                Password: Admin123!@#
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users and their roles',
      href: `/${locale}/admin/users`,
      color: 'bg-blue-500'
    },
    {
      title: 'Wallet Management',
      description: 'Manage cryptocurrency wallets',
      href: `/${locale}/admin/wallet`,
      color: 'bg-green-500'
    },
    {
      title: 'Messages',
      description: 'Handle user messages',
      href: `/${locale}/admin/messages`,
      color: 'bg-yellow-500'
    },
    {
      title: 'Reports',
      description: 'Financial reports and analytics',
      href: `/${locale}/admin/reports`,
      color: 'bg-purple-500'
    },
    {
      title: 'Full Control',
      description: 'Complete admin control',
      href: `/${locale}/admin/full-control`,
      color: 'bg-red-500'
    },
    {
      title: 'Performance',
      description: 'Platform performance monitoring',
      href: `/${locale}/admin/performance`,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome, {session.user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => (
            <div key={index} className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{section.title}</h3>
              <p className="text-muted-foreground mb-4">{section.description}</p>
              <a href={section.href} className="btn-primary">
                Access {section.title}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}