// Translation Service for Global Hedge AI Mobile App

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, SUPPORTED_LANGUAGES } from '../constants';

// Import translation files
import arTranslations from '../translations/ar.json';
import enTranslations from '../translations/en.json';
import frTranslations from '../translations/fr.json';
import trTranslations from '../translations/tr.json';
import esTranslations from '../translations/es.json';

export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'tr' | 'es';

interface Translations {
  [key: string]: any;
}

class TranslationService {
  private static instance: TranslationService;
  private currentLanguage: SupportedLanguage = 'ar';
  private translations: Translations = {};
  private listeners: Array<(language: SupportedLanguage) => void> = [];

  private constructor() {
    this.loadTranslations();
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  private loadTranslations(): void {
    this.translations = {
      ar: arTranslations,
      en: enTranslations,
      fr: frTranslations,
      tr: trTranslations,
      es: esTranslations,
    };
  }

  public async initialize(): Promise<void> {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (savedLanguage && this.isValidLanguage(savedLanguage)) {
        this.currentLanguage = savedLanguage as SupportedLanguage;
      } else {
        // Default to Arabic
        this.currentLanguage = 'ar';
        await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, 'ar');
      }
    } catch (error) {
      console.error('Error initializing translation service:', error);
      this.currentLanguage = 'ar';
    }
  }

  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  public async setLanguage(language: SupportedLanguage): Promise<void> {
    try {
      this.currentLanguage = language;
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
      this.notifyListeners();
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }

  public getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  public t(key: string, params?: { [key: string]: string | number }): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = this.translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found in any language
          }
        }
        break;
      }
    }

    if (typeof value === 'string') {
      // Replace parameters if provided
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match;
        });
      }
      return value;
    }

    return key; // Return key if value is not a string
  }

  public addLanguageChangeListener(listener: (language: SupportedLanguage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  private isValidLanguage(language: string): boolean {
    return ['ar', 'en', 'fr', 'tr', 'es'].includes(language);
  }

  public isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }

  public getLanguageDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  public getLanguageName(language: SupportedLanguage): string {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === language);
    return lang ? lang.name : language;
  }

  public getLanguageFlag(language: SupportedLanguage): string {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === language);
    return lang ? lang.flag : '🌐';
  }
}

export default TranslationService.getInstance();
