// Biometric Authentication Service for Global Hedge AI Mobile App

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: LocalAuthentication.AuthenticationType;
}

class BiometricService {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Check if device supports biometric authentication
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        console.log('Device does not support biometric authentication');
        return false;
      }

      // Check if biometric authentication is enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        console.log('No biometric authentication enrolled');
        return false;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing biometric service:', error);
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported biometric types:', error);
      return [];
    }
  }

  async getBiometryType(): Promise<LocalAuthentication.AuthenticationType | null> {
    try {
      const types = await this.getSupportedTypes();
      return types.length > 0 ? types[0] : null;
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  }

  async authenticate(reason: string = 'تأكيد هويتك للمتابعة'): Promise<BiometricResult> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return {
            success: false,
            error: 'Biometric authentication not available',
          };
        }
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'إلغاء',
        fallbackLabel: 'استخدام كلمة المرور',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const biometryType = await this.getBiometryType();
        return {
          success: true,
          biometryType: biometryType || undefined,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return {
        success: false,
        error: 'Authentication error',
      };
    }
  }

  async authenticateForLogin(): Promise<BiometricResult> {
    return this.authenticate('استخدم بصمتك أو وجهك لتسجيل الدخول');
  }

  async authenticateForTransaction(amount: number): Promise<BiometricResult> {
    return this.authenticate(`تأكيد المعاملة بقيمة $${amount}`);
  }

  async authenticateForSensitiveAction(action: string): Promise<BiometricResult> {
    return this.authenticate(`تأكيد ${action}`);
  }

  async isEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  async setEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Error setting biometric status:', error);
    }
  }

  async getBiometricIcon(): Promise<string> {
    try {
      const biometryType = await this.getBiometryType();
      
      switch (biometryType) {
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return '👤'; // Face ID
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return '👆'; // Touch ID / Fingerprint
        case LocalAuthentication.AuthenticationType.IRIS:
          return '👁️'; // Iris
        default:
          return '🔐'; // Generic biometric
      }
    } catch (error) {
      console.error('Error getting biometric icon:', error);
      return '🔐';
    }
  }

  async getBiometricName(): Promise<string> {
    try {
      const biometryType = await this.getBiometryType();
      
      switch (biometryType) {
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID';
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Touch ID';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Biometric';
      }
    } catch (error) {
      console.error('Error getting biometric name:', error);
      return 'Biometric';
    }
  }

  async canUseBiometric(): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();
      const isEnabled = await this.isEnabled();
      return isAvailable && isEnabled;
    } catch (error) {
      console.error('Error checking biometric usability:', error);
      return false;
    }
  }

  async setupBiometric(): Promise<{ success: boolean; error?: string }> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      // Test authentication
      const result = await this.authenticate('إعداد المصادقة البيومترية');
      if (result.success) {
        await this.setEnabled(true);
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to setup biometric authentication',
        };
      }
    } catch (error) {
      console.error('Error setting up biometric:', error);
      return {
        success: false,
        error: 'Setup failed',
      };
    }
  }

  async disableBiometric(): Promise<void> {
    try {
      await this.setEnabled(false);
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  }
}

export default new BiometricService();
