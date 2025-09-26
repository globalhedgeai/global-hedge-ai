import './globals.css';
import { headers } from 'next/headers';
import AuthHeader from "@/components/AuthHeader";
import { getSessionUser } from '@/lib/auth';

export const metadata = {
  title: 'Global Hedge AI',
  description: 'Your trusted partner in global investments',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  await getSessionUser(new Request(headersList.get('x-url') || ''));

  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthHeader />
        {children}
      </body>
    </html>
  );
}