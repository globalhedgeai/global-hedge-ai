// Translation Hook for Global Hedge AI Mobile App

import { useState, useEffect } from 'react';
import TranslationService, { SupportedLanguage } from '../services/translation';

export const useTranslation = () => {
  const [language, setLanguage] = useState<SupportedLanguage>(
    TranslationService.getCurrentLanguage()
  );

  useEffect(() => {
    const unsubscribe = TranslationService.addLanguageChangeListener((newLanguage) => {
      setLanguage(newLanguage);
    });

    return unsubscribe;
  }, []);

  const t = (key: string, params?: { [key: string]: string | number }) => {
    return TranslationService.t(key, params);
  };

  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    await TranslationService.setLanguage(newLanguage);
  };

  const isRTL = () => TranslationService.isRTL();
  const getLanguageDirection = () => TranslationService.getLanguageDirection();

  return {
    t,
    language,
    changeLanguage,
    isRTL,
    getLanguageDirection,
    supportedLanguages: TranslationService.getSupportedLanguages(),
  };
};
