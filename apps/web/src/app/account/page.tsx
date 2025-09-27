'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to localized account page
    router.replace('/en/account');
  }, [router]);

  return (
    <main className="p-6">
      <div className="text-center">Redirecting...</div>
    </main>
  );
}