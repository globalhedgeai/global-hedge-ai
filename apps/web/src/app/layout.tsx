import './globals.css';
import { headers } from 'next/headers';
import AuthHeader from "@/components/AuthHeader";
import { getSessionUser } from '@/lib/auth';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n/request';

export const metadata = {
  title: 'Global Hedge AI',
  description: 'Your trusted partner in global investments',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') ?? 'http';
  const host  = headersList.get('host') ?? `localhost:${process.env.PORT ?? '3001'}`;
  const url   = headersList.get('x-url') ?? `${proto}://${host}/`;
  await getSessionUser(new Request(url));

  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthHeader />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
