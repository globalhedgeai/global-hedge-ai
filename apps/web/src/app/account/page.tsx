import { redirect } from 'next/navigation';

export default function Page() {
  // Default redirect to Arabic account page
  // Language detection will be handled by middleware
  redirect('/ar/account');
}