// Enhanced Components for Global Hedge AI Mobile App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, ANIMATION_DURATION } from '../constants/enhancedConstants';

const { width, height } = Dimensions.get('window');

// Enhanced Loading Component
export const LoadingSpinner: React.FC<{
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}> = ({ size = 'large', color = COLORS.primary, text }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size={size} color={color} />
    {text && <Text style={styles.loadingText}>{text}</Text>}
  </View>
);

// Enhanced Button Component
export const EnhancedButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];
    
    if (fullWidth) {
      baseStyle.push(styles.buttonFullWidth);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    } else {
      baseStyle.push(styles[`button_${variant}`]);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, styles[`buttonText_${size}`]];
    
    if (disabled || loading) {
      baseStyle.push(styles.buttonTextDisabled);
    } else {
      baseStyle.push(styles[`buttonText_${variant}`]);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.background} />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <Text style={styles.buttonIcon}>{icon}</Text>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Enhanced Input Component
export const EnhancedInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  icon,
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }
    
    if (error) {
      baseStyle.push(styles.inputError);
    }
    
    if (disabled) {
      baseStyle.push(styles.inputDisabled);
    }
    
    if (multiline) {
      baseStyle.push(styles.inputMultiline);
    }
    
    return baseStyle;
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && <Text style={styles.inputLeftIcon}>{icon}</Text>}
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.inputRightIcon}>
            <Text style={styles.inputRightIconText}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
};

// Enhanced Card Component
export const EnhancedCard: React.FC<{
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: any;
  elevation?: boolean;
}> = ({ children, title, subtitle, onPress, style, elevation = true }) => {
  const cardStyle = [
    styles.card,
    elevation && styles.cardElevation,
    style,
  ];

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={cardStyle} onPress={onPress} activeOpacity={0.8}>
      {(title || subtitle) && (
        <View style={styles.cardHeader}>
          {title && <Text style={styles.cardTitle}>{title}</Text>}
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.cardContent}>
        {children}
      </View>
    </CardComponent>
  );
};

// Enhanced Modal Component
export const EnhancedModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
}> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  animationType = 'slide',
}) => {
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            {title && <Text style={styles.modalTitle}>{title}</Text>}
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={styles.modalContent}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Enhanced Alert Component
export const EnhancedAlert: React.FC<{
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}> = ({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'موافق',
  cancelText = 'إلغاء',
  showCancel = false,
}) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return styles.alertSuccess;
      case 'error':
        return styles.alertError;
      case 'warning':
        return styles.alertWarning;
      default:
        return styles.alertInfo;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.alertOverlay}>
        <View style={[styles.alertContainer, getAlertStyle()]}>
          <Text style={styles.alertIcon}>{getIcon()}</Text>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <View style={styles.alertButtons}>
            {showCancel && (
              <EnhancedButton
                title={cancelText}
                onPress={onCancel || onConfirm}
                variant="secondary"
                size="medium"
                style={styles.alertButton}
              />
            )}
            <EnhancedButton
              title={confirmText}
              onPress={onConfirm}
              variant="primary"
              size="medium"
              style={styles.alertButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Enhanced Progress Bar Component
export const EnhancedProgressBar: React.FC<{
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
}> = ({
  progress,
  height = 8,
  color = COLORS.primary,
  backgroundColor = COLORS.border,
  showPercentage = false,
  animated = true,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarBackground, { height, backgroundColor }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              height,
              backgroundColor: color,
              width: `${animatedProgress}%`,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.progressBarText}>{Math.round(progress)}%</Text>
      )}
    </View>
  );
};

// Enhanced Badge Component
export const EnhancedBadge: React.FC<{
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  rounded?: boolean;
}> = ({ text, variant = 'primary', size = 'medium', rounded = false }) => {
  const getBadgeStyle = () => {
    const baseStyle = [styles.badge, styles[`badge_${size}`]];
    
    if (rounded) {
      baseStyle.push(styles.badgeRounded);
    }
    
    baseStyle.push(styles[`badge_${variant}`]);
    
    return baseStyle;
  };

  const getTextStyle = () => {
    return [styles.badgeText, styles[`badgeText_${size}`], styles[`badgeText_${variant}`]];
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // Button styles
  button: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 32,
  },
  button_medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 44,
  },
  button_large: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    minHeight: 56,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  button_primary: {
    backgroundColor: COLORS.primary,
  },
  button_secondary: {
    backgroundColor: COLORS.secondary,
  },
  button_danger: {
    backgroundColor: COLORS.error,
  },
  button_success: {
    backgroundColor: COLORS.success,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: SPACING.sm,
    fontSize: 16,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonText_small: {
    fontSize: 14,
  },
  buttonText_medium: {
    fontSize: 16,
  },
  buttonText_large: {
    fontSize: 18,
  },
  buttonTextDisabled: {
    color: COLORS.textSecondary,
  },
  buttonText_primary: {
    color: COLORS.background,
  },
  buttonText_secondary: {
    color: COLORS.text,
  },
  buttonText_danger: {
    color: COLORS.background,
  },
  buttonText_success: {
    color: COLORS.background,
  },

  // Input styles
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLeftIcon: {
    position: 'absolute',
    left: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
    zIndex: 1,
  },
  inputRightIcon: {
    position: 'absolute',
    right: SPACING.md,
    zIndex: 1,
  },
  inputRightIconText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  inputErrorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: SPACING.xs,
  },

  // Card styles
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  cardElevation: {
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: SPACING.sm,
  },
  modalCloseButtonText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  modalContent: {
    padding: SPACING.lg,
  },

  // Alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: width * 0.8,
    alignItems: 'center',
  },
  alertSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  alertError: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  alertWarning: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  alertInfo: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  alertIcon: {
    fontSize: 32,
    marginBottom: SPACING.md,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  alertButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },

  // Progress bar styles
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: BORDER_RADIUS.sm,
  },
  progressBarText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },

  // Badge styles
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  badge_small: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badge_large: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  badgeRounded: {
    borderRadius: BORDER_RADIUS.round,
  },
  badge_primary: {
    backgroundColor: COLORS.primary,
  },
  badge_secondary: {
    backgroundColor: COLORS.secondary,
  },
  badge_success: {
    backgroundColor: COLORS.success,
  },
  badge_warning: {
    backgroundColor: COLORS.warning,
  },
  badge_error: {
    backgroundColor: COLORS.error,
  },
  badge_info: {
    backgroundColor: COLORS.info,
  },
  badgeText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeText_small: {
    fontSize: 12,
  },
  badgeText_medium: {
    fontSize: 14,
  },
  badgeText_large: {
    fontSize: 16,
  },
  badgeText_primary: {
    color: COLORS.background,
  },
  badgeText_secondary: {
    color: COLORS.text,
  },
  badgeText_success: {
    color: COLORS.background,
  },
  badgeText_warning: {
    color: COLORS.background,
  },
  badgeText_error: {
    color: COLORS.background,
  },
  badgeText_info: {
    color: COLORS.background,
  },
});
