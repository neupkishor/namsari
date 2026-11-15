'use client';

import ScrollToTop from '@/components/ScrollToTop';

// Adds client side route behavior to the manage shell.
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <><ScrollToTop />{children}</>;
}
