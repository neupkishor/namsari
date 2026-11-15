'use client';

import ProfileSidebar from './ProfileSidebar';
import ProfileHeader from './ProfileHeader';
import ScrollToTop from '@/components/ScrollToTop';

// Renders the profile shell using data loaded by the server layout.
export default function ClientLayout({ children, profile }: {
  children: React.ReactNode;
  profile: { user: any; isOwner: boolean; listingsCount: number; averageRating: number; reviewCount: number };
}) {
  const { user, isOwner, listingsCount, averageRating, reviewCount } = profile;
  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <ScrollToTop />
      <div className="max-w-[var(--container-max)] mx-auto mt-[var(--header-height)] px-4 lg:px-6 w-full">
        <ProfileHeader user={user} isOwner={isOwner} />
        <div className="grid gap-6 py-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ProfileSidebar user={user} listingsCount={listingsCount} rating={averageRating} reviewCount={reviewCount} isOwner={isOwner} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
