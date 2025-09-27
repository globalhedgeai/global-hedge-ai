import { redirect } from 'next/navigation';
import { locales, defaultLocale } from '@/i18n/request';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as typeof locales[number])) {
    redirect(`/${defaultLocale}`);
  }
  
  redirect(`/${locale}/market`);
}
