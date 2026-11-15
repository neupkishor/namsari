'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/menu/Sidebar';
import { getCurrentUser } from '@/actions/auth';

// Renders the sidebar shell and loads the signed-in user in the browser.
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchUser() {
      try {
        setUser(await getCurrentUser());
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    }
    void fetchUser();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start min-h-[calc(100vh-var(--header-height))] max-w-[var(--container-max)] mx-auto mt-[var(--header-height)] px-4 lg:px-5 xl:px-6 w-full relative bg-white">
      <div className="hidden lg:block w-[var(--sidebar-width)] flex-shrink-0">
        <div className="fixed z-30 h-[calc(100vh-var(--header-height))] min-h-0 w-[var(--sidebar-width)]" style={{ top: 'var(--header-height)', left: 'max(1.25rem, calc((100vw - var(--container-max)) / 2 + 1.25rem))' }}>
          <Sidebar user={user} loading={loading} />
        </div>
      </div>
      <main className="flex-1 w-full py-6 lg:py-8 min-w-0">{children}</main>
    </div>
  );
}
