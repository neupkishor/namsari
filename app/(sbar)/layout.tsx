import ServerLayout from './layout.server';
import ClientLayout from './layout.client';

// Merges the server and client shells for sidebar routes.
export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return <ServerLayout><ClientLayout>{children}</ClientLayout></ServerLayout>;
}
