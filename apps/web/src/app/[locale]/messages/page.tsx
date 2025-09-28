'use client';
import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface MessageThread {
  id: string;
  userId: string;
  userEmail: string;
  lastMessageAt: string;
  unreadForUser: number;
  lastMessage: {
    id: string;
    sender: 'USER' | 'ADMIN';
    body: string;
    createdAt: string;
  } | null;
}

interface MessagesData {
  threads: MessageThread[];
  unreadCount: number;
}

export default function MessagesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [messagesData, setMessagesData] = useState<MessagesData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isRTL = locale === 'ar';

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      
      if (data.ok) {
        setMessagesData(data);
        // Mark messages as read when page loads
        await fetch('/api/messages/read', { method: 'POST' });
      } else {
        setError(t('errors.generic'));
      }
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newMessage.trim() })
      });

      const data = await response.json();
      
      if (data.ok) {
        setNewMessage('');
        await fetchMessages(); // Refresh messages
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
        <h1 className="text-2xl font-bold">{t('messages.title')}</h1>
        {messagesData && messagesData.unreadCount > 0 && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            {messagesData.unreadCount}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Messages Thread */}
      {messagesData && messagesData.threads && messagesData.threads.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">{t('messages.conversation')}</h2>
            <p className="text-sm text-gray-600">{t('messages.withSupport')}</p>
          </div>
          
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {messagesData.threads[0].lastMessage && (
              <div className={`flex ${messagesData.threads[0].lastMessage.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  messagesData.threads[0].lastMessage.sender === 'USER' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  <p className="text-sm">{messagesData.threads[0].lastMessage.body}</p>
                  <p className={`text-xs mt-1 ${
                    messagesData.threads[0].lastMessage.sender === 'USER' 
                      ? 'text-blue-100' 
                      : 'text-gray-500'
                  }`}>
                    {formatDate(messagesData.threads[0].lastMessage.createdAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">{t('messages.noMessages')}</p>
        </div>
      )}

      {/* Send Message Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">{t('messages.sendMessage')}</h2>
        <form onSubmit={handleSendMessage} className="space-y-3">
          <div>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder={t('messages.messagePlaceholder')}
              disabled={isSending}
            />
          </div>
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? t('common.loading') : t('messages.send')}
          </button>
        </form>
      </div>
    </main>
  );
}
