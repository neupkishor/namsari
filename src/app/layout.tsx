'use client';

import React, { useEffect, useState } from 'react';
import { Outfit } from "next/font/google";
import "@/app/globals.css";
import Providers from "@/app/providers";
import { HeaderNavigation } from '@/components/HeaderNavigation';
import { FooterNavigation } from '@/components/FooterNavigation';
import { SidebarNavigation } from '@/components/navigation/Sidebar';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-outfit"
});

interface LayoutConfig {
    sidebar: boolean;
    header: boolean;
    footer: boolean;
}

const defaultLayout: LayoutConfig = { sidebar: true, header: true, footer: true };

const layoutRules: Record<string, LayoutConfig> = {
    '/': { sidebar: true, header: true, footer: true },
    '/home': { sidebar: true, header: true, footer: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const config = layoutRules[pathname] || defaultLayout;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
        const userData = await getCurrentUser();
        setUser(userData);
    }
    fetchUser();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Namsari</title>
        <meta name="description" content="Experience the difference with Namsari." />
      </head>
      <body className={`${outfit.className}`}>
        <Providers>
            {config.header && <HeaderNavigation user={user} />}
            
            <div style={{ 
                display: 'flex', 
                minHeight: 'calc(100vh - var(--header-height))',
                maxWidth: 'var(--container-max)',
                margin: '0 auto',
                padding: '0 24px',
                width: '100%',
                position: 'relative'
            }}>
                {config.sidebar && (
                    <div className="desktop-sidebar-wrapper" style={{ width: '280px', flexShrink: 0 }}>
                        <SidebarNavigation user={user} />
                    </div>
                )}
                
                <main style={{ 
                    flex: 1, 
                    width: '100%', 
                    paddingTop: '32px',
                    paddingLeft: config.sidebar ? '32px' : '0'
                }}>
                    {children}
                </main>
            </div>

            {config.footer && <FooterNavigation />}

            <style jsx global>{`
                .desktop-sidebar-wrapper {
                    display: none;
                }
                @media (min-width: 1024px) {
                    .desktop-sidebar-wrapper {
                        display: block;
                    }
                }
                @media (max-width: 1024px) {
                   main {
                       padding-left: 0 !important;
                   }
                }
            `}</style>
        </Providers>
      </body>
    </html>
  );
}
