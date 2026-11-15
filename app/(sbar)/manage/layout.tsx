import ServerLayout from './layout.server';
import ClientLayout from './layout.client';

// Merges the manage route's server and client shells.
export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return <ServerLayout><ClientLayout>{children}</ClientLayout></ServerLayout>;
}
