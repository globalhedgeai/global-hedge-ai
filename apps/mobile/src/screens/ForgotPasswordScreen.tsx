import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TranslationService from '../services/translation';
import { API_CONFIG } from '../constants';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetLink = async () => {
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError(TranslationService.t('auth.validation.emailRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setError(TranslationService.t('auth.validation.emailInvalid'));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess(TranslationService.t('auth.resetPasswordSent'));
        setStep('reset');
      } else {
        setError(data.error || TranslationService.t('errors.genericError'));
      }
    } catch (err) {
      console.error('Error sending reset link:', err);
      setError(TranslationService.t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setSuccess(null);

    if (!resetToken.trim()) {
      setError(TranslationService.t('auth.resetTokenRequired'));
      return;
    }

    if (!newPassword.trim()) {
      setError(TranslationService.t('auth.validation.passwordRequired'));
      return;
    }

    if (newPassword.length < 8) {
      setError(TranslationService.t('auth.validation.passwordMinLength'));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetToken,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setSuccess(TranslationService.t('auth.resetSuccess'));
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(data.error || TranslationService.t('auth.resetError'));
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(TranslationService.t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {TranslationService.t('auth.forgotPassword')}
            </Text>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🔒</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {step === 'email'
              ? TranslationService.t('auth.forgotPasswordTitle')
              : TranslationService.t('auth.resetPassword')}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? TranslationService.t('auth.forgotPasswordSubtitle')
              : TranslationService.t('auth.enterTokenAndPassword')}
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {step === 'email' ? (
              <>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {TranslationService.t('auth.email')}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={TranslationService.t('auth.emailPlaceholder')}
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSendResetLink}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {TranslationService.t('auth.sendResetLink')}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Reset Token Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {TranslationService.t('auth.resetToken')}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={TranslationService.t('auth.tokenPlaceholder')}
                    placeholderTextColor="#64748B"
                    value={resetToken}
                    onChangeText={setResetToken}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                {/* New Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {TranslationService.t('auth.newPassword')}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={TranslationService.t('auth.passwordPlaceholder')}
                    placeholderTextColor="#64748B"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {TranslationService.t('auth.resetPassword')}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Back to Email Button */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setStep('email')}
                  disabled={loading}
                >
                  <Text style={styles.secondaryButtonText}>
                    {TranslationService.t('auth.requestNewReset')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Success Message */}
          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>
              {TranslationService.t('auth.needHelp')}
            </Text>
            <Text style={styles.helpText}>
              {TranslationService.t('auth.supportDescription')}
            </Text>
            {step === 'reset' && (
              <Text style={styles.helpText}>
                ⚠️ {TranslationService.t('auth.checkEmail')}
              </Text>
            )}
          </View>

          {/* Back to Login */}
          <TouchableOpacity style={styles.backToLoginButton} onPress={onBack}>
            <Text style={styles.backToLoginText}>
              {TranslationService.t('auth.backToLogin')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  backButtonText: {
    fontSize: 24,
    color: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginLeft: 12,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#1E3A5F',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: '#14532D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  successText: {
    color: '#86EFAC',
    fontSize: 14,
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginTop: 4,
  },
  backToLoginButton: {
    alignItems: 'center',
    padding: 12,
  },
  backToLoginText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;

