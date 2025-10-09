'use client';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation, useLanguage } from '@/lib/translations';

interface ThreadMessage {
  id: string;
  sender: 'USER' | 'ADMIN';
  body: string;
  createdAt: string;
}

interface MessageThread {
  id: string;
  userId: string;
  userEmail: string;
  lastMessageAt: string;
  unreadForUser: number;
  unreadForAdmin: number;
  messages: ThreadMessage[];
}

interface AdminMessagesData {
  threads: MessageThread[];
  totalUnread: number;
}

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [messagesData, setMessagesData] = useState<AdminMessagesData | null>(null);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isRTL = locale === 'ar';

  const fetchAdminMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/messages');
      const data = await response.json();
      
      if (data.ok) {
        setMessagesData(data);
        if (data.threads.length > 0 && !selectedThread) {
          setSelectedThread(data.threads[0]);
        }
      } else {
        setError(t('errors.generic'));
      }
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  }, [t, selectedThread]);

  useEffect(() => {
    fetchAdminMessages();
  }, [fetchAdminMessages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread.id,
          body: newMessage.trim()
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        setNewMessage('');
        await fetchAdminMessages(); // Refresh messages
      } else {
        setError(t('errors.generic'));
      }
    } catch {
      setError(t('errors.networkError'));
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
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </main>
    );
  }

  return (
    <main className={`p-6 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('messages.title')} - {t('navigation.admin')}</h1>
        {messagesData && messagesData.totalUnread > 0 && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            {messagesData.totalUnread}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threads List */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">{t('messages.conversations')}</h2>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {messagesData && messagesData.threads.length > 0 ? (
              <div className="space-y-1">
                {messagesData.threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 ${
                      selectedThread?.id === thread.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {thread.userEmail}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(thread.lastMessageAt)}
                        </div>
                      </div>
                      {thread.unreadForAdmin > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {thread.unreadForAdmin}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {t('messages.noMessages')}
              </div>
            )}
          </div>
        </div>

        {/* Messages View */}
        <div className="lg:col-span-2 space-y-4">
          {selectedThread ? (
            <>
              {/* Messages */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">{t('messages.conversation')}</h2>
                  <p className="text-sm text-gray-600">{selectedThread.userEmail}</p>
                </div>
                
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  {selectedThread.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'ADMIN' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.body}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'ADMIN' 
                            ? 'text-blue-100' 
                            : 'text-gray-500'
                        }`}>
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">{t('messages.reply')}</h2>
                <form onSubmit={handleSendReply} className="space-y-3">
                  <div>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                      placeholder={t('messages.replyPlaceholder')}
                      disabled={isSending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? t('common.loading') : t('messages.reply')}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">{t('messages.selectThread')}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}