// Messages Screen for Global Hedge AI Mobile App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import ApiService from '../services/api';

interface Message {
  id: string;
  type: 'system' | 'support' | 'announcement';
  title: string;
  body: string;
  readAt?: string;
  createdAt: string;
}

interface MessagesScreenProps {
  onBack: () => void;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'support'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await ApiService.getMessages();
      if (response.ok) {
        setMessages(response.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const markAsRead = async (messageId: string) => {
    try {
      await ApiService.markMessageAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, readAt: new Date().toISOString() }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system':
        return '⚙️';
      case 'support':
        return '🎧';
      case 'announcement':
        return '📢';
      default:
        return '💬';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'system':
        return COLORS.primary;
      case 'support':
        return COLORS.success;
      case 'announcement':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !message.readAt;
    if (filter === 'system') return message.type === 'system';
    if (filter === 'support') return message.type === 'support';
    return true;
  });

  const unreadCount = messages.filter(msg => !msg.readAt).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('messages.title')}</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: t('messages.all') },
            { key: 'unread', label: t('messages.unread') },
            { key: 'system', label: t('messages.system') },
            { key: 'support', label: t('messages.support') },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterButton,
                filter === filterOption.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterOption.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterOption.key && styles.filterButtonTextActive,
                ]}
              >
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : filteredMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>{t('messages.noMessages')}</Text>
          </View>
        ) : (
          filteredMessages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={[
                styles.messageCard,
                !message.readAt && styles.messageCardUnread,
              ]}
              onPress={() => markAsRead(message.id)}
            >
              <View style={styles.messageHeader}>
                <View style={styles.messageInfo}>
                  <Text style={styles.messageIcon}>
                    {getMessageIcon(message.type)}
                  </Text>
                  <View style={styles.messageDetails}>
                    <Text style={styles.messageTitle}>{message.title}</Text>
                    <Text style={styles.messageDate}>
                      {new Date(message.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                {!message.readAt && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.messageBody} numberOfLines={3}>
                {message.body}
              </Text>
              <View style={styles.messageFooter}>
                <Text style={styles.messageType}>
                  {t(`messages.type.${message.type}`)}
                </Text>
                <Text
                  style={[
                    styles.messageStatus,
                    { color: getMessageColor(message.type) },
                  ]}
                >
                  {message.readAt ? t('messages.read') : t('messages.unread')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  filters: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterButton: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  messageCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  messageIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  messageDetails: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  messageDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  messageBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  messageStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default MessagesScreen;
