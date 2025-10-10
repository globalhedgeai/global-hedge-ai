// Messages Screen for Global Hedge AI Mobile App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import ApiService from '../services/api';

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

interface MessagesScreenProps {
  onBack: () => void;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await ApiService.getMessages();
      if (response.ok) {
        setThread(response.data);
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

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await ApiService.sendMessage(newMessage.trim());
      if (response.ok) {
        setNewMessage('');
        await loadMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const unreadCount = thread?.unreadForUser || 0;

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
        ) : !thread || thread.messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No messages yet. Start a conversation with our support team!</Text>
          </View>
        ) : (
          <>
            {/* Messages */}
            {thread.messages.map((message) => (
              <View key={message.id} style={styles.messageContainer}>
                <View style={[
                  styles.messageBubble,
                  message.sender === 'USER' ? styles.userMessage : styles.adminMessage
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.sender === 'USER' ? styles.userMessageText : styles.adminMessageText
                  ]}>
                    {message.body}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    message.sender === 'USER' ? styles.userMessageTime : styles.adminMessageTime
                  ]}>
                    {formatDate(message.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
            
            {/* Send Message Form */}
            <View style={styles.sendMessageContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.messageInput}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Type your message here..."
                  multiline
                  maxLength={2000}
                />
              </View>
              <TouchableOpacity
                style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!newMessage.trim() || isSending}
              >
                <Text style={styles.sendButtonText}>
                  {isSending ? 'Sending...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
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
  messageContainer: {
    marginBottom: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  adminMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.text,
  },
  adminMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  userMessageTime: {
    color: COLORS.text,
    opacity: 0.7,
  },
  adminMessageTime: {
    color: COLORS.textSecondary,
  },
  sendMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  messageInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  sendButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default MessagesScreen;

