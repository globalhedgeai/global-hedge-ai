// This file is no longer needed as we're using a custom translation system
// Keeping it for reference but it's not used in the new system

export const locales = ['ar', 'en', 'tr', 'fr', 'es'] as const;
export const defaultLocale = 'en' as const;

export type Locale = typeof locales[number];
