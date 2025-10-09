// Notification Service for Global Hedge AI Mobile App

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  type: 'deposit' | 'withdrawal' | 'reward' | 'message' | 'system' | 'market';
}

class NotificationService {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      // Save permission status
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, 'true');

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Global Hedge AI',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#f0b90b',
          sound: 'default',
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async scheduleLocalNotification(notification: NotificationData): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          badge: 1,
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async scheduleDailyRewardReminder(): Promise<void> {
    try {
      // Schedule daily reward reminder at 9 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎁 مكافأة يومية جاهزة!',
          body: 'لا تنسى المطالبة بمكافأتك اليومية',
          data: { type: 'daily_reward' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling daily reward reminder:', error);
    }
  }

  async scheduleMarketAlert(symbol: string, targetPrice: number): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📈 تنبيه السوق - ${symbol}`,
          body: `وصل ${symbol} إلى السعر المستهدف: $${targetPrice}`,
          data: { type: 'market_alert', symbol, targetPrice },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error scheduling market alert:', error);
    }
  }

  async showDepositNotification(amount: number, status: string): Promise<void> {
    const title = status === 'APPROVED' ? '✅ تم قبول الإيداع' : '⏳ طلب الإيداع قيد المراجعة';
    const body = status === 'APPROVED' 
      ? `تم قبول إيداعك بقيمة $${amount}` 
      : `طلب إيداع بقيمة $${amount} قيد المراجعة`;

    await this.scheduleLocalNotification({
      title,
      body,
      type: 'deposit',
      data: { amount, status },
    });
  }

  async showWithdrawalNotification(amount: number, status: string): Promise<void> {
    const title = status === 'APPROVED' ? '✅ تم قبول السحب' : '⏳ طلب السحب قيد المراجعة';
    const body = status === 'APPROVED' 
      ? `تم قبول سحبك بقيمة $${amount}` 
      : `طلب سحب بقيمة $${amount} قيد المراجعة`;

    await this.scheduleLocalNotification({
      title,
      body,
      type: 'withdrawal',
      data: { amount, status },
    });
  }

  async showRewardNotification(amount: number, type: 'daily' | 'random'): Promise<void> {
    const title = type === 'daily' ? '🎁 مكافأة يومية!' : '🎲 مكافأة عشوائية!';
    const body = `تهانينا! حصلت على مكافأة بقيمة $${amount}`;

    await this.scheduleLocalNotification({
      title,
      body,
      type: 'reward',
      data: { amount, rewardType: type },
    });
  }

  async showMessageNotification(sender: string, message: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: `💬 رسالة جديدة من ${sender}`,
      body: message,
      type: 'message',
      data: { sender, message },
    });
  }

  async showSystemNotification(title: string, message: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: `🔔 ${title}`,
      body: message,
      type: 'system',
      data: { title, message },
    });
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  // Listen for notification events
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  async isEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking notification status:', error);
      return false;
    }
  }

  async setEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled.toString());
      
      if (enabled) {
        await this.initialize();
      } else {
        await this.cancelAllNotifications();
        await this.clearBadge();
      }
    } catch (error) {
      console.error('Error setting notification status:', error);
    }
  }
}

export default new NotificationService();
