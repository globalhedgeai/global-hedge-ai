"use client";
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// إنشاء سياق اللغة
const LanguageContext = createContext<{
  locale: string;
  setLocale: (locale: string) => void;
  isLoading: boolean;
}>({
  locale: 'ar',
  setLocale: () => {},
  isLoading: false
});

// Hook لاستخدام السياق
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// قائمة اللغات المدعومة
export const SUPPORTED_LOCALES = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' }
] as const;

export type Locale = typeof SUPPORTED_LOCALES[number]['code'];

// مكون مزود اللغة
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar'); // تغيير القيمة الافتراضية إلى العربية
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // تحميل اللغة من الرابط أو المحفوظة عند البدء
  useEffect(() => {
    // أولاً، حاول قراءة اللغة من الرابط
    const pathSegments = pathname.split('/').filter(Boolean);
    const urlLocale = pathSegments[0] as Locale;
    
    console.log('Pathname:', pathname, 'URL Locale:', urlLocale); // إضافة تسجيل للتشخيص
    
    if (urlLocale && SUPPORTED_LOCALES.some(l => l.code === urlLocale)) {
      console.log('Setting locale from URL:', urlLocale); // إضافة تسجيل للتشخيص
      setLocaleState(urlLocale);
      localStorage.setItem('selected-locale', urlLocale);
    } else {
      // إذا لم توجد في الرابط، استخدم المحفوظة أو الإنجليزية كافتراضي
      const savedLocale = localStorage.getItem('selected-locale') as Locale;
      if (savedLocale && SUPPORTED_LOCALES.some(l => l.code === savedLocale)) {
        console.log('Setting locale from localStorage:', savedLocale); // إضافة تسجيل للتشخيص
        setLocaleState(savedLocale);
      } else {
        // إذا لم توجد لغة محفوظة، استخدم العربية كافتراضي
        console.log('Setting default locale: ar'); // إضافة تسجيل للتشخيص
        setLocaleState('ar');
        localStorage.setItem('selected-locale', 'ar');
      }
    }
  }, [pathname]);

  // دالة تغيير اللغة
  const setLocale = (newLocale: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // حفظ اللغة في localStorage
    localStorage.setItem('selected-locale', newLocale);
    
    // حساب المسار الجديد
    let newPath = pathname;
    
    // إزالة اللغة الحالية من المسار
    SUPPORTED_LOCALES.forEach(loc => {
      const prefix = `/${loc.code}`;
      if (newPath.startsWith(prefix)) {
        newPath = newPath.substring(prefix.length);
        if (!newPath.startsWith('/')) {
          newPath = '/' + newPath;
        }
      }
    });
    
    // تنظيف المسار
    if (newPath === '/' || newPath === '') {
      newPath = '';
    }
    
    // إضافة اللغة الجديدة
    const finalPath = `/${newLocale}${newPath}`;
    
    // تحديث حالة اللغة
    setLocaleState(newLocale as Locale);
    
    // تحديث HTML attributes
    document.documentElement.lang = newLocale;
    document.documentElement.dir = SUPPORTED_LOCALES.find(l => l.code === newLocale)?.dir || 'ltr';
    
    // التنقل مع إعادة تحميل كاملة
    setTimeout(() => {
      window.location.href = finalPath;
    }, 100);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

// مكون تبديل اللغة المتطور
export default function AdvancedLanguageSwitcher() {
  const { locale, setLocale, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = SUPPORTED_LOCALES.find(l => l.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-accent/50 border border-border rounded-lg hover:bg-accent hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Switch language"
      >
        <span className="text-lg">{currentLocale?.flag}</span>
        <span className="hidden sm:inline">{currentLocale?.name}</span>
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50">
          <div className="py-1">
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => {
                  setLocale(loc.code);
                  setIsOpen(false);
                }}
                disabled={isLoading}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-accent transition-colors duration-200 ${
                  loc.code === locale ? 'bg-primary/10 text-primary' : 'text-foreground'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-lg">{loc.flag}</span>
                <span>{loc.name}</span>
                {loc.code === locale && (
                  <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
