"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';

interface Message {
  id: string;
  sender: 'USER' | 'ADMIN';
  body: string;
  createdAt: string;
}

interface MessageThread {
  id: string;
  userId: string;
  lastMessageAt: string;
  unreadForUser: number;
  unreadForAdmin: number;
  messages: Message[];
}

export default function MessagesPage() {
  const { t, locale } = useTranslation();
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      
      if (data.ok) {
        setThread(data.thread);
      } else {
        setError('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: newMessage.trim()
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        setNewMessage('');
        await fetchMessages(); // Refresh messages
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Network error');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">Messages</h1>
          </div>
          <p className="text-muted-foreground text-lg">Contact support team</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Support Messages</h2>
              {thread && thread.unreadForUser > 0 && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                  {thread.unreadForUser} unread
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {thread && thread.messages.length > 0 ? (
                thread.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'USER' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm">{message.body}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'USER' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No messages yet. Start a conversation with our support team!</p>
                </div>
              )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none"
                  rows={4}
                  placeholder="Type your message here..."
                  disabled={isSending}
                />
              </div>
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}