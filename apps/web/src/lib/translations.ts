// نظام إدارة الترجمات النهائي والمحسن
import { useMemo } from 'react';
import { useLanguage } from '@/components/AdvancedLanguageSwitcher';

// إعادة تصدير useLanguage من AdvancedLanguageSwitcher
export { useLanguage } from '@/components/AdvancedLanguageSwitcher';

// تعريف أنواع البيانات للترجمات
interface TranslationObject {
  [key: string]: string | TranslationObject;
}

interface TranslationsCache {
  ar: TranslationObject;
  en: TranslationObject;
  tr: TranslationObject;
  fr: TranslationObject;
  es: TranslationObject;
}

// دالة تحميل الترجمات مع معالجة الأخطاء
function loadTranslations(): TranslationsCache {
  let arTranslations: TranslationObject = {};
  let enTranslations: TranslationObject = {};
  let trTranslations: TranslationObject = {};
  let frTranslations: TranslationObject = {};
  let esTranslations: TranslationObject = {};

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    arTranslations = require('@/messages/ar.json') as TranslationObject;
  } catch (e) {
    console.error('❌ Failed to load Arabic translations:', e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    enTranslations = require('@/messages/en.json') as TranslationObject;
  } catch (e) {
    console.error('❌ Failed to load English translations:', e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    trTranslations = require('@/messages/tr.json') as TranslationObject;
  } catch (e) {
    console.error('❌ Failed to load Turkish translations:', e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    frTranslations = require('@/messages/fr.json') as TranslationObject;
  } catch (e) {
    console.error('❌ Failed to load French translations:', e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    esTranslations = require('@/messages/es.json') as TranslationObject;
  } catch (e) {
    console.error('❌ Failed to load Spanish translations:', e);
  }

  return {
    ar: arTranslations,
    en: enTranslations,
    tr: trTranslations,
    fr: frTranslations,
    es: esTranslations,
  };
}

// تصدير الترجمات
export const translations = loadTranslations();

// Hook للترجمة المحسن مع معالجة شاملة للأخطاء وتحسين الأداء
export function useTranslation() {
  const { locale } = useLanguage();
  
  const t = useMemo(() => {
    return (key: string): string => {
      try {
        // التحقق من وجود المفتاح
        if (!key || typeof key !== 'string') {
          console.warn('⚠️ Invalid translation key:', key);
          return key || 'INVALID_KEY';
        }

        // الحصول على ترجمات اللغة المختارة
        const localeTranslations = translations[locale as keyof typeof translations];
        if (!localeTranslations) {
          console.warn(`⚠️ No translations found for locale: ${locale}`);
          return key;
        }
        
        // دعم المفاتيح المتداخلة مثل 'dashboard.subtitle'
        const keys = key.split('.');
        let translation: string | TranslationObject = localeTranslations;
        
        for (const k of keys) {
          if (translation && typeof translation === 'object' && k in translation) {
            translation = translation[k];
          } else {
            console.warn(`⚠️ No translation found for key: ${key} in locale: ${locale}`);
            return key;
          }
        }
        
        if (typeof translation === 'string') {
          return translation;
        } else {
          console.warn(`⚠️ Translation for key: ${key} is not a string in locale: ${locale}`);
          return key;
        }
      } catch (error) {
        console.error(`❌ Error in translation for key: ${key} in locale: ${locale}`, error);
        return key;
      }
    };
  }, [locale]);
  
  return { t, locale };
}