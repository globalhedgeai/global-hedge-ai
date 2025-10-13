"use client";
import React, { useState, useEffect } from 'react';

interface MessageThread {
  id: string;
  userId: string;
  lastMessageAt: string;
  unreadForUser: number;
  unreadForAdmin: number;
  messages?: Message[];
  userEmail?: string;
}

interface Message {
  id: string;
  sender: string;
  body: string;
  createdAt: string;
  isFromAdmin?: boolean;
}

interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  };
  ok?: boolean;
}

interface MessagesResponse {
  threads: MessageThread[];
  totalUnread?: number;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

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

  const fetchThreadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${threadId}`);
      const data = await response.json();
      
      if (data.ok) {
        setSelectedThread(data.thread);
      }
    } catch (error) {
      console.error('Error fetching thread messages:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;
    
    setReplying(true);
    try {
      const response = await fetch('/api/admin/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: selectedThread.id,
          message: replyText.trim()
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setReplyText('');
        fetchThreadMessages(selectedThread.id);
        fetchMessages(); // Refresh the list
        alert('Reply sent successfully!');
      } else {
        alert('Error sending reply: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply');
    } finally {
      setReplying(false);
    }
  };

  const markAsRead = async (threadId: string) => {
    try {
      const response = await fetch('/api/admin/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId }),
      });
      
      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
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

  if (!session?.ok || session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300">You need admin privileges to access this page.</p>
          <a href="/en/admin" className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors mt-4">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-gray-300 text-lg">Handle user messages and support requests</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Message Threads {messages?.totalUnread ? `(${messages.totalUnread} unread)` : ''}
            </h2>
            <a href="/en/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">
              Back to Dashboard
            </a>
          </div>

          {messages?.threads && messages.threads.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Threads List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Message Threads</h3>
                {messages?.threads?.map((thread: { id: string; userId: string; lastMessageAt: string; unreadForUser: number; unreadForAdmin: number }) => (
                  <div 
                    key={thread.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id 
                        ? 'border-yellow-500 bg-gray-700' 
                        : 'border-gray-700 bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => {
                      fetchThreadMessages(thread.id);
                      markAsRead(thread.id);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-white">User {thread.userId.slice(-8)}</p>
                        <p className="text-sm text-gray-400">
                          Last message: {new Date(thread.lastMessageAt).toLocaleString()}
                        </p>
                      </div>
                      {thread.unreadForAdmin > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {thread.unreadForAdmin}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      <p>Latest message available</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Thread View */}
              <div className="space-y-4">
                {selectedThread ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">
                        Conversation with {selectedThread.userEmail || `User ${selectedThread.userId}`}
                      </h3>
                      <button
                        onClick={() => setSelectedThread(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Messages */}
                    <div className="bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                      {selectedThread.messages?.map((message: Message, index: number) => (
                        <div key={index} className={`mb-4 ${message.isFromAdmin ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block p-3 rounded-lg max-w-xs ${
                            message.isFromAdmin 
                              ? 'bg-yellow-500 text-black' 
                              : 'bg-gray-600 text-white'
                          }`}>
                            <p className="text-sm">{message.body}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply Form */}
                    <form onSubmit={handleReply} className="space-y-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Reply to {selectedThread.userEmail || `User ${selectedThread.userId}`}
                        </label>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 h-24 resize-none"
                          placeholder="Type your reply here..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={replying || !replyText.trim()}
                        className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {replying ? 'Sending...' : 'Send Reply'}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-xl font-semibold text-gray-300">Select a conversation</p>
                    <p className="text-sm text-gray-400">Click on a message thread to view and reply</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-300">No messages found</p>
              <p className="text-sm text-gray-400">No user messages to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}