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

// استيراد ملفات الترجمة مباشرة
import arTranslations from '@/messages/ar.json';
import enTranslations from '@/messages/en.json';
import trTranslations from '@/messages/tr.json';
import frTranslations from '@/messages/fr.json';
import esTranslations from '@/messages/es.json';

// تصدير الترجمات مباشرة
export const translations: TranslationsCache = {
  ar: arTranslations as TranslationObject,
  en: enTranslations as TranslationObject,
  tr: trTranslations as TranslationObject,
  fr: frTranslations as TranslationObject,
  es: esTranslations as TranslationObject,
};

// Hook للترجمة المحسن مع معالجة شاملة للأخطاء وتحسين الأداء
export function useTranslation() {
  const { locale } = useLanguage();
  
  const t = useMemo(() => {
    return (key: string): string => {
      try {
        // التحقق من وجود المفتاح
        if (!key || typeof key !== 'string') {
          return key || 'INVALID_KEY';
        }

        // الحصول على ترجمات اللغة المختارة
        const localeTranslations = translations[locale as keyof typeof translations];
        if (!localeTranslations) {
          // Fallback إلى الإنجليزية إذا لم توجد الترجمة
          const fallbackTranslations = translations.en;
          if (fallbackTranslations) {
            const keys = key.split('.');
            let translation: string | TranslationObject = fallbackTranslations;
            
            for (const k of keys) {
              if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
              } else {
                return key;
              }
            }
            
            if (typeof translation === 'string') {
              return translation;
            }
          }
          return key;
        }
        
        // دعم المفاتيح المتداخلة مثل 'dashboard.subtitle'
        const keys = key.split('.');
        let translation: string | TranslationObject = localeTranslations;
        
        for (const k of keys) {
          if (translation && typeof translation === 'object' && k in translation) {
            translation = translation[k];
          } else {
            // Fallback إلى الإنجليزية
            const fallbackTranslations = translations.en;
            if (fallbackTranslations) {
              let fallbackTranslation: string | TranslationObject = fallbackTranslations;
              for (const fallbackKey of keys) {
                if (fallbackTranslation && typeof fallbackTranslation === 'object' && fallbackKey in fallbackTranslation) {
                  fallbackTranslation = fallbackTranslation[fallbackKey];
                } else {
                  return key;
                }
              }
              if (typeof fallbackTranslation === 'string') {
                return fallbackTranslation;
              }
            }
            return key;
          }
        }
        
        if (typeof translation === 'string') {
          return translation;
        } else {
          return key;
        }
      } catch (error) {
        return key;
      }
    };
  }, [locale]);
  
  return { t, locale };
}