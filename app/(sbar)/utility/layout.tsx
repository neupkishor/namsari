import ServerLayout from './layout.server';
import ClientLayout from './layout.client';

// Merges the utility route's server and client shells.
export default function UtilityLayout({ children }: { children: React.ReactNode }) {
  return <ServerLayout><ClientLayout>{children}</ClientLayout></ServerLayout>;
}
