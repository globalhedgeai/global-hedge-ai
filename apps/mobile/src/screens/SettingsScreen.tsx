// Settings Screen for Global Hedge AI Mobile App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeService from '../services/theme';
import BiometricService from '../services/biometric';
import NotificationService from '../services/notifications';
import { STORAGE_KEYS } from '../constants';
import LanguageSettings from '../components/LanguageSettings';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

type SettingsSection = 'main' | 'notifications' | 'biometric' | 'theme' | 'language';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onLogout }) => {
  const { t } = useTranslation();
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
  const [currentTheme, setCurrentTheme] = useState(ThemeService.getCurrentTheme());
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
    
    // Listen for theme changes
    const unsubscribe = ThemeService.addListener((theme) => {
      setCurrentTheme(theme);
    });

    return unsubscribe;
  }, []);

  const loadSettings = async () => {
    try {
      const biometric = await BiometricService.isEnabled();
      const notifications = await NotificationService.isEnabled();
      
      setBiometricEnabled(biometric);
      setNotificationsEnabled(notifications);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('settings.logout'), 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.multiRemove([
                STORAGE_KEYS.USER_TOKEN,
                STORAGE_KEYS.USER_DATA,
                STORAGE_KEYS.BIOMETRIC_ENABLED,
                STORAGE_KEYS.NOTIFICATIONS_ENABLED,
              ]);
              
              // Cancel all notifications
              await NotificationService.cancelAllNotifications();
              
              onLogout();
            } catch (error) {
              console.error('Error during logout:', error);
              onLogout();
            }
          }
        },
      ]
    );
  };

  const renderMainSettings = () => {
    if (!currentTheme) return null;

    const dynamicStyles = {
      container: {
        backgroundColor: currentTheme.colors.background,
      },
      title: {
        color: currentTheme.colors.text,
      },
      backButton: {
        backgroundColor: currentTheme.colors.surface,
      },
      backButtonText: {
        color: currentTheme.colors.text,
      },
      sectionTitle: {
        color: currentTheme.colors.text,
      },
      settingItem: {
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border,
      },
      settingText: {
        color: currentTheme.colors.text,
      },
      settingDescription: {
        color: currentTheme.colors.textSecondary,
      },
      settingValue: {
        color: currentTheme.colors.primary,
      },
      logoutButton: {
        backgroundColor: currentTheme.colors.error,
      },
      logoutButtonText: {
        color: currentTheme.colors.errorForeground,
      },
    };

    return (
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={[styles.backButton, dynamicStyles.backButton]}>
            <Text style={[styles.backButtonText, dynamicStyles.backButtonText]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, dynamicStyles.title]}>{t('settings.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('settings.security')}</Text>
          
          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.settingItem]}
            onPress={() => setCurrentSection('biometric')}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingText, dynamicStyles.settingText]}>
                  {biometricEnabled ? '👆' : '🔐'} المصادقة البيومترية
                </Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  استخدام بصمة الإصبع أو Face ID
                </Text>
              </View>
              <Text style={[styles.settingValue, dynamicStyles.settingValue]}>
                {biometricEnabled ? 'مفعل' : 'غير مفعل'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('settings.notifications')}</Text>
          
          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.settingItem]}
            onPress={() => setCurrentSection('notifications')}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingText, dynamicStyles.settingText]}>
                  {notificationsEnabled ? '🔔' : '🔕'} {t('settings.notifications')}
                </Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  {t('settings.notificationsDesc')}
                </Text>
              </View>
              <Text style={[styles.settingValue, dynamicStyles.settingValue]}>
                {notificationsEnabled ? 'مفعل' : 'غير مفعل'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('settings.theme')}</Text>
          
          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.settingItem]}
            onPress={() => setCurrentSection('theme')}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingText, dynamicStyles.settingText]}>
                  {currentTheme.mode === 'light' ? '☀️' : currentTheme.mode === 'dark' ? '🌙' : '🌓'} الوضع
                </Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  {currentTheme.mode === 'light' ? 'فاتح' : currentTheme.mode === 'dark' ? 'مظلم' : 'تلقائي'}
                </Text>
              </View>
              <Text style={[styles.settingValue, dynamicStyles.settingValue]}>
                {currentTheme.mode === 'light' ? 'فاتح' : currentTheme.mode === 'dark' ? 'مظلم' : 'تلقائي'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.settingItem]}
            onPress={() => setCurrentSection('language')}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingText, dynamicStyles.settingText]}>
                  🌐 اللغة
                </Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  اختر اللغة المفضلة
                </Text>
              </View>
              <Text style={[styles.settingValue, dynamicStyles.settingValue]}>
                العربية
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>الحساب</Text>
          
          <TouchableOpacity
            style={[styles.settingItem, dynamicStyles.settingItem]}
            onPress={handleLogout}
          >
            <View style={styles.settingContent}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingText, { color: currentTheme.colors.error }]}>
                  🚪 {t('settings.logout')}
                </Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  {t('settings.logoutConfirm')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={[styles.appInfo, dynamicStyles.settingItem]}>
            <Text style={[styles.appInfoText, dynamicStyles.settingDescription]}>
              Global Hedge AI v1.0.0
            </Text>
            <Text style={[styles.appInfoText, dynamicStyles.settingDescription]}>
              تطبيق آمن وموثوق للاستثمار
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'notifications':
        return (
          <NotificationSettings
            onClose={() => setCurrentSection('main')}
          />
        );
      case 'biometric':
        return (
          <BiometricSettings
            onClose={() => setCurrentSection('main')}
          />
        );
      case 'theme':
        return (
          <ThemeSettings
            onClose={() => setCurrentSection('main')}
          />
        );
      case 'language':
        return (
          <LanguageSettings
            onClose={() => setCurrentSection('main')}
          />
        );
      default:
        return renderMainSettings();
    }
  };

  if (!currentTheme) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {renderCurrentSection()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  appInfo: {
    padding: 16,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default SettingsScreen;
