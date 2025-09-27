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
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const host  = headersList.get('host') || `localhost:${process.env.PORT || '3001'}`;
  const url   = headersList.get('x-url') || `${proto}://${host}/`;
  await getSessionUser(new Request(url));

  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthHeader />
        {children}
      </body>
    </html>
  );
}
