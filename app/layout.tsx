import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import '@/app/globals.css';
import { getCurrentUser } from '@/services/auth/actions';
import { Header } from '@/components/menu/Header';
import ServerLayout from './layout.server';
import ClientLayout from './layout.client';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Namsari',
  description: 'Real Estate Application',
};

// Merges the server and client shells into the Next.js root layout.
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <ServerLayout>
          <ClientLayout header={<Header user={user} />}>{children}</ClientLayout>
        </ServerLayout>
      </body>
    </html>
  );
}
