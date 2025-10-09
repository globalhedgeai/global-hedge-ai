// نظام إدارة الترجمات النهائي والمحسن
import { useMemo } from 'react';
import { useLanguage } from '@/components/AdvancedLanguageSwitcher';

// إعادة تصدير useLanguage من AdvancedLanguageSwitcher
export { useLanguage } from '@/components/AdvancedLanguageSwitcher';

// استيراد ملفات الترجمة مع معالجة شاملة للأخطاء
let translationsCache: any = null;

// دالة تحميل الترجمات مع التخزين المؤقت ومعالجة الأخطاء
function loadTranslations() {
  if (translationsCache) {
    return translationsCache;
  }

  let arTranslations: any = {};
  let enTranslations: any = {};
  let trTranslations: any = {};
  let frTranslations: any = {};
  let esTranslations: any = {};

  try {
    arTranslations = require('@/messages/ar.json');
    console.log('✅ Arabic translations loaded successfully');
  } catch (e) {
    console.error('❌ Failed to load Arabic translations:', e);
  }

  try {
    enTranslations = require('@/messages/en.json');
    console.log('✅ English translations loaded successfully');
  } catch (e) {
    console.error('❌ Failed to load English translations:', e);
  }

  try {
    trTranslations = require('@/messages/tr.json');
    console.log('✅ Turkish translations loaded successfully');
  } catch (e) {
    console.error('❌ Failed to load Turkish translations:', e);
  }

  try {
    frTranslations = require('@/messages/fr.json');
    console.log('✅ French translations loaded successfully');
  } catch (e) {
    console.error('❌ Failed to load French translations:', e);
  }

  try {
    esTranslations = require('@/messages/es.json');
    console.log('✅ Spanish translations loaded successfully');
  } catch (e) {
    console.error('❌ Failed to load Spanish translations:', e);
  }

  translationsCache = {
    ar: arTranslations,
    en: enTranslations,
    tr: trTranslations,
    fr: frTranslations,
    es: esTranslations,
  };

  console.log('🎉 All translations loaded successfully');
  return translationsCache;
}

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
        let translation: any = localeTranslations;
        
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