'use client';

import Providers from '@/app/providers';
import { FloatingActionButton } from '@/components/menu/FloatingActionButton';
import { Tracker } from '@/components/analytics/Tracker';

// Provides client context and global interactive controls.
export default function ClientLayout({ children, header }: { children: React.ReactNode; header: React.ReactNode }) {
  return (
    <Providers>
      <Tracker />
      {header}
      {children}
      <FloatingActionButton />
    </Providers>
  );
}
