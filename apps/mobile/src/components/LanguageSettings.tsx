// Language Settings Component for Global Hedge AI Mobile App

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../hooks/useTranslation';
import ThemeService from '../services/theme';

interface LanguageSettingsProps {
  onClose: () => void;
}

const LanguageSettings: React.FC<LanguageSettingsProps> = ({ onClose }) => {
  const { t, language, changeLanguage, supportedLanguages } = useTranslation();
  const [currentTheme, setCurrentTheme] = useState(ThemeService.getCurrentTheme());

  React.useEffect(() => {
    const unsubscribe = ThemeService.addListener((theme) => {
      setCurrentTheme(theme);
    });
    return unsubscribe;
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode as any);
  };

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
    languageItem: {
      backgroundColor: currentTheme.colors.surface,
      borderColor: currentTheme.colors.border,
    },
    languageText: {
      color: currentTheme.colors.text,
    },
    languageDescription: {
      color: currentTheme.colors.textSecondary,
    },
    selectedLanguage: {
      backgroundColor: currentTheme.colors.primary + '20',
      borderColor: currentTheme.colors.primary,
    },
    selectedLanguageText: {
      color: currentTheme.colors.primary,
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={[styles.backButton, dynamicStyles.backButton]}>
            <Text style={[styles.backButtonText, dynamicStyles.backButtonText]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, dynamicStyles.title]}>{t('settings.language')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Language Options */}
        <View style={styles.languageList}>
          {supportedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                dynamicStyles.languageItem,
                language === lang.code && dynamicStyles.selectedLanguage,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.languageContent}>
                <View style={styles.languageInfo}>
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <View style={styles.languageDetails}>
                    <Text
                      style={[
                        styles.languageText,
                        dynamicStyles.languageText,
                        language === lang.code && dynamicStyles.selectedLanguageText,
                      ]}
                    >
                      {lang.name}
                    </Text>
                    <Text style={[styles.languageDescription, dynamicStyles.languageDescription]}>
                      {lang.code.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {language === lang.code && (
                  <Text style={[styles.checkmark, dynamicStyles.selectedLanguageText]}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoText, dynamicStyles.languageDescription]}>
            {t('settings.languageDesc')}
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
  languageList: {
    marginBottom: 24,
  },
  languageItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  languageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageDetails: {
    flex: 1,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  languageDescription: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 16,
    backgroundColor: 'rgba(240, 185, 11, 0.1)',
    borderRadius: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LanguageSettings;
