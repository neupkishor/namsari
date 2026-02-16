import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import ProfileSidebar from '@/app/(profile)/[@username]/ProfileSidebar';
import ProfileHeader from './ProfileHeader';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        '@username': string;
    }>;
}

import ScrollToTop from '@/components/ScrollToTop';

export default async function ProfileLayout({ children, params }: LayoutProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    const session = await getSession();

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const user = await prisma.user.findUnique({
        where: { username: decoded }
    });

    if (!user) return notFound();

    const isOwner = session?.id === user.id.toString();

    // Fetch stats for sidebar
    const [listingsCount, reviewsAggregate] = await Promise.all([
        prisma.property.count({
            where: { listedById: user.id }
        }),
        prisma.review.aggregate({
            where: { receiver_id: user.id },
            _avg: { rating: true },
            _count: { rating: true }
        })
    ]);

    const averageRating = reviewsAggregate._avg.rating || 0;
    const reviewCount = reviewsAggregate._count.rating || 0;

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <ScrollToTop />
            
            {/* Profile Header (Cover, Info, Tabs) */}
            <ProfileHeader user={user} isOwner={isOwner} />

            <div className="layout-container profile-main-grid">
                {/* Persistent Sidebar */}
                <ProfileSidebar user={user} listingsCount={listingsCount} rating={averageRating} reviewCount={reviewCount} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
