"use client";
import React, { useState, useEffect } from 'react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      setSession(data);
      
      if (data.ok && data.user.role === 'ADMIN') {
        fetchMessages();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages');
      const data = await response.json();
      
      if (data.ok) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
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

  if (!session?.ok || session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          <a href="/admin" className="btn-primary mt-4">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Messages</h1>
          <p className="text-muted-foreground text-lg">Handle user messages and support requests</p>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Message Threads {messages?.totalUnread ? `(${messages.totalUnread} unread)` : ''}
            </h2>
            <a href="/admin" className="btn-secondary">
              Back to Dashboard
            </a>
          </div>

          {messages?.threads?.length > 0 ? (
            <div className="space-y-4">
              {messages.threads.map((thread: any) => (
                <div key={thread.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-foreground">{thread.userEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Last message: {new Date(thread.lastMessageAt).toLocaleString()}
                      </p>
                    </div>
                    {thread.unreadForAdmin > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {thread.unreadForAdmin}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {thread.messages?.length > 0 && (
                      <p>Latest: {thread.messages[0].body}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-muted-foreground">No messages found</p>
              <p className="text-sm text-muted-foreground">No user messages to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
