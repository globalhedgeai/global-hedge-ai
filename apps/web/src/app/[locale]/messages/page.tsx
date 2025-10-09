'use client';

import { useState, useEffect } from 'react';
import { useTranslation, useLanguage } from '@/lib/translations';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  type: 'support' | 'notification' | 'system';
}

export default function MessagesPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      if (data.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      const data = await response.json();
      if (data.ok) {
        setNewMessage('');
        setMessage(`✅ ${t('messages.sent')}`);
        await fetchMessages();
      } else {
        setMessage(`❌ ${data.error || t('errors.generic')}`);
      }
    } catch (error) {
      setMessage(`❌ ${t('errors.generic')}`);
    } finally {
      setIsSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST'
      });
      await fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'support':
        return (
          <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
          </svg>
        );
      case 'notification':
        return (
          <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7H4.828z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getMessageTypeText = (type: string) => {
    switch (type) {
      case 'support':
        return t('messages.support');
      case 'notification':
        return t('messages.notification');
      default:
        return t('messages.system');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">{t('messages.title')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{t('messages.subtitle')}</p>
        </div>

        {/* App Download Notice */}
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-yellow-400/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">G</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground">📱 {t('phoneApp.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('phoneApp.description')}</p>
              </div>
            </div>
            <Link href={`/${locale}/download`} className="btn-primary px-4 py-2 text-sm">
              {t('phoneApp.download')}
            </Link>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-error/10 text-error border border-error/20'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Message Form */}
          <div className="animate-fade-in">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('messages.sendMessage')}</h2>
                
                <form onSubmit={sendMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('messages.message')}
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      className="input w-full h-32 resize-none"
                      placeholder={t('messages.messagePlaceholder')}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="btn-primary w-full py-3"
                  >
                    {isSending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('messages.sending')}</span>
                      </div>
                    ) : (
                      t('messages.send')
                    )}
                  </button>
                </form>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">{t('messages.quickActions')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewMessage(t('messages.depositIssue'))}
                      className="btn-secondary text-sm py-2"
                    >
                      {t('messages.depositIssue')}
                    </button>
                    <button
                      onClick={() => setNewMessage(t('messages.withdrawalIssue'))}
                      className="btn-secondary text-sm py-2"
                    >
                      {t('messages.withdrawalIssue')}
                    </button>
                    <button
                      onClick={() => setNewMessage(t('messages.accountIssue'))}
                      className="btn-secondary text-sm py-2"
                    >
                      {t('messages.accountIssue')}
                    </button>
                    <button
                      onClick={() => setNewMessage(t('messages.generalQuestion'))}
                      className="btn-secondary text-sm py-2"
                    >
                      {t('messages.generalQuestion')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="animate-fade-in">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('messages.messageHistory')}</h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">{t('messages.noMessages')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                          msg.isRead 
                            ? 'bg-accent/30 border-border hover:bg-accent/40' 
                            : 'bg-primary/10 border-primary/20 hover:bg-primary/15'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            msg.isRead ? 'bg-accent/50' : 'bg-primary/20'
                          }`}>
                            <span className="text-lg">{getMessageIcon(msg.type)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {getMessageTypeText(msg.type)}
                                </span>
                                {!msg.isRead && (
                                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(msg.createdAt).toLocaleDateString(locale, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {!msg.isRead && (
                                  <button
                                    onClick={() => markAsRead(msg.id)}
                                    className="text-xs text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors"
                                  >
                                    {t('messages.markAsRead')}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}