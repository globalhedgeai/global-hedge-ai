// Biometric Settings Component for Global Hedge AI Mobile App

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
import BiometricService from '../services/biometric';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';

interface BiometricSettingsProps {
  onClose?: () => void;
}

const BiometricSettings: React.FC<BiometricSettingsProps> = ({ onClose }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricType, setBiometricType] = useState<string>('');
  const [biometricIcon, setBiometricIcon] = useState('🔐');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const available = await BiometricService.isAvailable();
      const enabled = await BiometricService.isEnabled();
      const type = await BiometricService.getBiometricName();
      const icon = await BiometricService.getBiometricIcon();
      
      setIsAvailable(available);
      setIsEnabled(enabled);
      setBiometricType(type);
      setBiometricIcon(icon);
    } catch (error) {
      console.error('Error loading biometric settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    try {
      setIsLoading(true);
      
      if (value) {
        // Setup biometric authentication
        const result = await BiometricService.setupBiometric();
        if (result.success) {
          setIsEnabled(true);
          Alert.alert('تم', 'تم تفعيل المصادقة البيومترية بنجاح');
        } else {
          Alert.alert('خطأ', result.error || 'فشل في تفعيل المصادقة البيومترية');
        }
      } else {
        // Disable biometric authentication
        await BiometricService.disableBiometric();
        setIsEnabled(false);
        Alert.alert('تم', 'تم إلغاء تفعيل المصادقة البيومترية');
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('خطأ', 'فشل في تغيير إعدادات المصادقة البيومترية');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestBiometric = async () => {
    try {
      const result = await BiometricService.authenticateForLogin();
      if (result.success) {
        Alert.alert('نجح', 'تم التحقق من المصادقة البيومترية بنجاح');
      } else {
        Alert.alert('فشل', result.error || 'فشل في التحقق من المصادقة البيومترية');
      }
    } catch (error) {
      console.error('Error testing biometric:', error);
      Alert.alert('خطأ', 'فشل في اختبار المصادقة البيومترية');
    }
  };

  const handleSetupBiometric = async () => {
    try {
      setIsLoading(true);
      const result = await BiometricService.setupBiometric();
      if (result.success) {
        setIsEnabled(true);
        Alert.alert('تم', 'تم إعداد المصادقة البيومترية بنجاح');
      } else {
        Alert.alert('خطأ', result.error || 'فشل في إعداد المصادقة البيومترية');
      }
    } catch (error) {
      console.error('Error setting up biometric:', error);
      Alert.alert('خطأ', 'فشل في إعداد المصادقة البيومترية');
    } finally {
      setIsLoading(false);
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

  if (!isAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>المصادقة البيومترية</Text>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.unavailableContainer}>
            <Text style={styles.unavailableIcon}>🔒</Text>
            <Text style={styles.unavailableTitle}>غير متاح</Text>
            <Text style={styles.unavailableDescription}>
              المصادقة البيومترية غير متاحة على هذا الجهاز
            </Text>
            <Text style={styles.unavailableSubDescription}>
              تأكد من أن جهازك يدعم بصمة الإصبع أو Face ID وأنه مُعد في إعدادات الهاتف
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>المصادقة البيومترية</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Biometric Info */}
        <View style={styles.section}>
          <View style={styles.biometricInfo}>
            <Text style={styles.biometricIcon}>{biometricIcon}</Text>
            <View style={styles.biometricDetails}>
              <Text style={styles.biometricName}>{biometricType}</Text>
              <Text style={styles.biometricDescription}>
                استخدم {biometricType} لتسجيل الدخول بسرعة وأمان
              </Text>
            </View>
          </View>
        </View>

        {/* Main Toggle */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>تفعيل المصادقة البيومترية</Text>
              <Text style={styles.settingDescription}>
                استخدام {biometricType} لتسجيل الدخول والمعاملات المهمة
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={isEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Actions */}
        {isEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الإجراءات</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTestBiometric}
            >
              <Text style={styles.actionButtonText}>اختبار المصادقة البيومترية</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isEnabled && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={handleSetupBiometric}
            >
              <Text style={styles.setupButtonText}>إعداد المصادقة البيومترية</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الأمان</Text>
          
          <View style={styles.securityItem}>
            <Text style={styles.securityIcon}>🔐</Text>
            <Text style={styles.securityText}>
              البيانات البيومترية محفوظة محلياً على جهازك فقط
            </Text>
          </View>
          
          <View style={styles.securityItem}>
            <Text style={styles.securityIcon}>⚡</Text>
            <Text style={styles.securityText}>
              تسجيل دخول سريع وآمن بدون كتابة كلمة المرور
            </Text>
          </View>
          
          <View style={styles.securityItem}>
            <Text style={styles.securityIcon}>🛡️</Text>
            <Text style={styles.securityText}>
              حماية إضافية للمعاملات المهمة
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            💡 يمكنك إلغاء تفعيل المصادقة البيومترية في أي وقت والعودة لاستخدام كلمة المرور
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
  biometricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  biometricIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  biometricDetails: {
    flex: 1,
  },
  biometricName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  biometricDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
  setupButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  setupButtonText: {
    color: COLORS.successForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
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
  unavailableContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  unavailableIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  unavailableTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  unavailableDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  unavailableSubDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default BiometricSettings;
