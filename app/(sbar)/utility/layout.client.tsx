'use client';

// Renders the client side utility content container.
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1400px] px-0.5 pt-3 sm:px-6 lg:px-8" style={{ paddingBottom: '80px' }}>{children}</div>;
}
