import ServerLayout, { loadProfileLayout } from './layout.server';
import ClientLayout from './layout.client';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ '@username': string }>;
};

// Combines profile data loading with the profile client shell.
export default async function ProfileLayout({ children, params }: LayoutProps) {
  const profile = await loadProfileLayout(params);
  return (
    <ServerLayout>
      <ClientLayout profile={profile}>{children}</ClientLayout>
    </ServerLayout>
  );
}
