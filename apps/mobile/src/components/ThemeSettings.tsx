// Theme Settings Component for Global Hedge AI Mobile App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemeService, { ThemeMode } from '../services/theme';
import { SPACING, BORDER_RADIUS } from '../constants';

interface ThemeSettingsProps {
  onClose?: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onClose }) => {
  const [currentTheme, setCurrentTheme] = useState(ThemeService.getCurrentTheme());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
    
    // Listen for theme changes
    const unsubscribe = ThemeService.addListener((theme) => {
      setCurrentTheme(theme);
    });

    return unsubscribe;
  }, []);

  const loadTheme = async () => {
    try {
      const theme = await ThemeService.initialize();
      setCurrentTheme(theme);
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    try {
      setIsLoading(true);
      const theme = await ThemeService.setTheme(mode);
      setCurrentTheme(theme);
    } catch (error) {
      console.error('Error changing theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTheme = async () => {
    try {
      setIsLoading(true);
      const theme = await ThemeService.toggleTheme();
      setCurrentTheme(theme);
    } catch (error) {
      console.error('Error toggling theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.colors.background || '#0b0e11' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: currentTheme?.colors.text || '#ffffff' }]}>
            جاري التحميل...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentTheme) {
    return null;
  }

  const dynamicStyles = {
    container: {
      backgroundColor: currentTheme.colors.background,
    },
    title: {
      color: currentTheme.colors.text,
    },
    closeButton: {
      backgroundColor: currentTheme.colors.surface,
    },
    closeButtonText: {
      color: currentTheme.colors.text,
    },
    sectionTitle: {
      color: currentTheme.colors.text,
    },
    themeOption: {
      backgroundColor: currentTheme.colors.surface,
      borderColor: currentTheme.colors.border,
    },
    themeOptionActive: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    themeOptionText: {
      color: currentTheme.colors.text,
    },
    themeOptionTextActive: {
      color: currentTheme.colors.primaryForeground,
    },
    themeDescription: {
      color: currentTheme.colors.textSecondary,
    },
    themeDescriptionActive: {
      color: currentTheme.colors.primaryForeground,
    },
    previewCard: {
      backgroundColor: currentTheme.colors.card,
      borderColor: currentTheme.colors.border,
    },
    previewText: {
      color: currentTheme.colors.text,
    },
    previewTextSecondary: {
      color: currentTheme.colors.textSecondary,
    },
    infoText: {
      color: currentTheme.colors.textSecondary,
    },
  };

  const themeOptions = [
    {
      mode: 'light' as ThemeMode,
      name: 'فاتح',
      icon: '☀️',
      description: 'وضع فاتح مناسب للاستخدام في النهار',
    },
    {
      mode: 'dark' as ThemeMode,
      name: 'مظلم',
      icon: '🌙',
      description: 'وضع مظلم مناسب للاستخدام في الليل',
    },
    {
      mode: 'auto' as ThemeMode,
      name: 'تلقائي',
      icon: '🌓',
      description: 'يتغير تلقائياً حسب إعدادات النظام',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.title]}>إعدادات المظهر</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, dynamicStyles.closeButton]}>
              <Text style={[styles.closeButtonText, dynamicStyles.closeButtonText]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Current Theme Info */}
        <View style={styles.section}>
          <View style={[styles.currentThemeInfo, dynamicStyles.previewCard]}>
            <Text style={styles.currentThemeIcon}>{currentTheme.mode === 'light' ? '☀️' : currentTheme.mode === 'dark' ? '🌙' : '🌓'}</Text>
            <View style={styles.currentThemeDetails}>
              <Text style={[styles.currentThemeName, dynamicStyles.previewText]}>
                الوضع الحالي: {currentTheme.mode === 'light' ? 'فاتح' : currentTheme.mode === 'dark' ? 'مظلم' : 'تلقائي'}
              </Text>
              <Text style={[styles.currentThemeDescription, dynamicStyles.previewTextSecondary]}>
                {currentTheme.mode === 'light' 
                  ? 'وضع فاتح مناسب للاستخدام في النهار'
                  : currentTheme.mode === 'dark' 
                  ? 'وضع مظلم مناسب للاستخدام في الليل'
                  : 'يتغير تلقائياً حسب إعدادات النظام'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>اختر الوضع</Text>
          
          {themeOptions.map((option) => {
            const isActive = currentTheme.mode === option.mode;
            return (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.themeOption,
                  dynamicStyles.themeOption,
                  isActive && styles.themeOptionActive,
                  isActive && dynamicStyles.themeOptionActive,
                ]}
                onPress={() => handleThemeChange(option.mode)}
              >
                <View style={styles.themeOptionContent}>
                  <Text style={styles.themeOptionIcon}>{option.icon}</Text>
                  <View style={styles.themeOptionInfo}>
                    <Text style={[
                      styles.themeOptionName,
                      dynamicStyles.themeOptionText,
                      isActive && dynamicStyles.themeOptionTextActive,
                    ]}>
                      {option.name}
                    </Text>
                    <Text style={[
                      styles.themeOptionDescription,
                      dynamicStyles.themeDescription,
                      isActive && dynamicStyles.themeDescriptionActive,
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={styles.activeIndicator}>
                      <Text style={styles.activeIndicatorText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Toggle */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.quickToggleButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={handleToggleTheme}
          >
            <Text style={[styles.quickToggleText, { color: currentTheme.colors.primaryForeground }]}>
              تبديل سريع: {currentTheme.isDark ? 'فاتح' : 'مظلم'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>معاينة المظهر</Text>
          
          <View style={[styles.previewCard, dynamicStyles.previewCard]}>
            <View style={styles.previewHeader}>
              <View style={[styles.previewAvatar, { backgroundColor: currentTheme.colors.primary }]}>
                <Text style={styles.previewAvatarText}>G</Text>
              </View>
              <View style={styles.previewHeaderInfo}>
                <Text style={[styles.previewTitle, dynamicStyles.previewText]}>Global Hedge AI</Text>
                <Text style={[styles.previewSubtitle, dynamicStyles.previewTextSecondary]}>رصيدك: $1,234.56</Text>
              </View>
            </View>
            
            <View style={styles.previewContent}>
              <View style={[styles.previewItem, { backgroundColor: currentTheme.colors.surface }]}>
                <Text style={[styles.previewItemText, dynamicStyles.previewText]}>إيداع</Text>
                <Text style={[styles.previewItemValue, { color: currentTheme.colors.success }]}>+$100</Text>
              </View>
              
              <View style={[styles.previewItem, { backgroundColor: currentTheme.colors.surface }]}>
                <Text style={[styles.previewItemText, dynamicStyles.previewText]}>سحب</Text>
                <Text style={[styles.previewItemValue, { color: currentTheme.colors.error }]}>-$50</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoSection, { backgroundColor: currentTheme.colors.surface }]}>
          <Text style={[styles.infoText, dynamicStyles.infoText]}>
            💡 يمكنك تغيير الوضع في أي وقت. التغييرات تُطبق فوراً
          </Text>
        </View>
      </ScrollView>
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
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  currentThemeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  currentThemeIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  currentThemeDetails: {
    flex: 1,
  },
  currentThemeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentThemeDescription: {
    fontSize: 14,
  },
  themeOption: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  themeOptionActive: {
    borderWidth: 2,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  themeOptionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  themeOptionInfo: {
    flex: 1,
  },
  themeOptionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  themeOptionDescription: {
    fontSize: 14,
  },
  activeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicatorText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickToggleButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  quickToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  previewAvatarText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewHeaderInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewSubtitle: {
    fontSize: 14,
  },
  previewContent: {
    gap: SPACING.sm,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  previewItemText: {
    fontSize: 14,
  },
  previewItemValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ThemeSettings;
