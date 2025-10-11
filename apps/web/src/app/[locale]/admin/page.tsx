"use client";
import React, { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

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

  const handleLogin = async () => {
    setLoginLoading(true);
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
      console.log('Login result:', data);
      
      if (data.ok) {
        await checkSession();
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error: ' + error);
    } finally {
      setLoginLoading(false);
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

  if (!session?.ok || !session?.user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-black">A</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Admin Login Required
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Please login to access the admin panel
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <button
              onClick={handleLogin}
              disabled={loginLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {loginLoading ? 'Signing in...' : 'Login as Admin'}
            </button>
            <div className="text-center">
              <p className="text-sm text-gray-300">
                Email: admin@globalhedgeai.com
              </p>
              <p className="text-sm text-gray-300">
                Password: Admin123!@#
              </p>
            </div>
            <div className="text-center">
              <a href="/en/admin/login" className="text-yellow-500 hover:text-yellow-400 text-sm">
                Or go to separate login page
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users and their roles',
      href: '/en/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Wallet Management',
      description: 'Manage cryptocurrency wallets',
      href: '/en/admin/wallet',
      color: 'bg-green-500'
    },
    {
      title: 'Messages',
      description: 'Handle user messages',
      href: '/en/admin/messages',
      color: 'bg-yellow-500'
    },
    {
      title: 'Reports',
      description: 'Financial reports and analytics',
      href: '/en/admin/reports',
      color: 'bg-purple-500'
    },
    {
      title: 'Full Control',
      description: 'Complete admin control',
      href: '/en/admin/full-control',
      color: 'bg-red-500'
    },
    {
      title: 'Performance',
      description: 'Platform performance monitoring',
      href: '/en/admin/performance',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 md:hidden">
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-300 text-sm">Welcome, {session.user.email}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Desktop Header */}
        <div className="mb-6 md:mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300 text-lg">Welcome, {session.user.email}</p>
        </div>

        {/* Mobile-First Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {adminSections.map((section, index) => (
            <div key={index} className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center mb-3">
                <div className={`w-3 h-3 rounded-full ${section.color} mr-3`}></div>
                <h3 className="text-base md:text-lg font-semibold text-white">{section.title}</h3>
              </div>
              <p className="text-gray-300 text-sm md:text-base mb-4">{section.description}</p>
              <a 
                href={section.href} 
                className="inline-block w-full text-center bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors font-medium"
              >
                Access {section.title}
              </a>
            </div>
          ))}
        </div>

        {/* Mobile Quick Actions */}
        <div className="mt-6 md:hidden">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <a href="/en/admin/users" className="block bg-blue-500 text-white px-4 py-2 rounded text-center">
                Manage Users
              </a>
              <a href="/en/admin/messages" className="block bg-green-500 text-white px-4 py-2 rounded text-center">
                View Messages
              </a>
              <a href="/en/admin/reports" className="block bg-purple-500 text-white px-4 py-2 rounded text-center">
                Financial Reports
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}