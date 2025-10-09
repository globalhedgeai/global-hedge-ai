// Notification Settings Component for Global Hedge AI Mobile App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationService from '../services/notifications';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';

interface NotificationSettingsProps {
  onClose?: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    deposits: true,
    withdrawals: true,
    rewards: true,
    messages: true,
    system: true,
    market: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await NotificationService.isEnabled();
      setIsEnabled(enabled);
      
      // Load individual notification preferences
      // This would typically come from AsyncStorage
      
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      setIsLoading(true);
      await NotificationService.setEnabled(value);
      setIsEnabled(value);
      
      if (value) {
        // Initialize notifications
        const initialized = await NotificationService.initialize();
        if (!initialized) {
          Alert.alert(
            'خطأ',
            'فشل في تفعيل الإشعارات. تأكد من السماح للإشعارات في إعدادات الهاتف.',
            [{ text: 'موافق' }]
          );
          setIsEnabled(false);
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('خطأ', 'فشل في تغيير إعدادات الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (key: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.showSystemNotification(
        'اختبار الإشعارات',
        'تم إرسال هذا الإشعار للاختبار'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('خطأ', 'فشل في إرسال إشعار الاختبار');
    }
  };

  const handleScheduleDailyReminder = async () => {
    try {
      await NotificationService.scheduleDailyRewardReminder();
      Alert.alert('تم', 'تم جدولة تذكير المكافآت اليومية');
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      Alert.alert('خطأ', 'فشل في جدولة التذكير');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>إعدادات الإشعارات</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Toggle */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>تفعيل الإشعارات</Text>
              <Text style={styles.settingDescription}>
                استقبال الإشعارات المهمة من التطبيق
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={isEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Individual Settings */}
        {isEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>أنواع الإشعارات</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إشعارات الإيداع</Text>
                <Text style={styles.settingDescription}>
                  إشعارات عند قبول أو رفض طلبات الإيداع
                </Text>
              </View>
              <Switch
                value={permissions.deposits}
                onValueChange={() => handleTogglePermission('deposits')}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={permissions.deposits ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إشعارات السحب</Text>
                <Text style={styles.settingDescription}>
                  إشعارات عند قبول أو رفض طلبات السحب
                </Text>
              </View>
              <Switch
                value={permissions.withdrawals}
                onValueChange={() => handleTogglePermission('withdrawals')}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={permissions.withdrawals ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إشعارات المكافآت</Text>
                <Text style={styles.settingDescription}>
                  إشعارات المكافآت اليومية والعشوائية
                </Text>
              </View>
              <Switch
                value={permissions.rewards}
                onValueChange={() => handleTogglePermission('rewards')}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={permissions.rewards ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إشعارات الرسائل</Text>
                <Text style={styles.settingDescription}>
                  إشعارات الرسائل الجديدة من الدعم
                </Text>
              </View>
              <Switch
                value={permissions.messages}
                onValueChange={() => handleTogglePermission('messages')}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={permissions.messages ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إشعارات النظام</Text>
                <Text style={styles.settingDescription}>
                  إشعارات التحديثات والإعلانات المهمة
                </Text>
              </View>
              <Switch
                value={permissions.system}
                onValueChange={() => handleTogglePermission('system')}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={permissions.system ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إشعارات السوق</Text>
                <Text style={styles.settingDescription}>
                  إشعارات تغيرات الأسعار المهمة
                </Text>
              </View>
              <Switch
                value={permissions.market}
                onValueChange={() => handleTogglePermission('market')}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={permissions.market ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
        )}

        {/* Actions */}
        {isEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الإجراءات</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTestNotification}
            >
              <Text style={styles.actionButtonText}>إرسال إشعار اختبار</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleScheduleDailyReminder}
            >
              <Text style={styles.actionButtonText}>جدولة تذكير المكافآت</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            💡 يمكنك تغيير إعدادات الإشعارات في أي وقت من خلال إعدادات الهاتف
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NotificationSettings;
