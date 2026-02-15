import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@/app/globals.css";
import Providers from "@/app/providers";
import { Header } from '@/components/menu/Header';
import { BottomNavigation } from '@/components/menu/BottomNavigation';
import { getCurrentUser } from '@/actions/auth';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Namsari",
  description: "Real Estate Application",
};

import { Tracker } from '@/components/analytics/Tracker';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <Providers>
            <Tracker />
            <Header user={user} />
            {children}
            <div className="mobile-only">
                <BottomNavigation user={user} />
            </div>
        </Providers>
      </body>
    </html>
  );
}