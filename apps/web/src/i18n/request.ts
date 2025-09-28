import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['ar', 'en', 'tr', 'fr', 'es'] as const;
export const defaultLocale = 'ar' as const;

export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) notFound();

  return {
    locale: locale as Locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
