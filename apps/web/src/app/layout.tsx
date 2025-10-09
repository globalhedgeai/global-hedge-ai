import './globals.css';
import { headers } from 'next/headers';
import AuthHeader from "@/components/AuthHeader";
import PWAInstaller from "@/components/PWAInstaller";
import InstallPrompt from "@/components/InstallPrompt";
import { getSessionUser } from '@/lib/auth';
import { LanguageProvider } from '@/components/AdvancedLanguageSwitcher';

export const metadata = {
  title: 'Global Hedge AI',
  description: 'Your trusted partner in global investments',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Global Hedge AI',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f0b90b',
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') ?? 'http';
  const host  = headersList.get('host') ?? `localhost:${process.env.PORT ?? '3001'}`;
  const url   = headersList.get('x-url') ?? `${proto}://${host}/`;
  await getSessionUser(new Request(url));

  return (
    <html lang="ar" dir="rtl">
      <body>
        <LanguageProvider>
          <PWAInstaller />
          <AuthHeader />
          {children}
          <InstallPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}
