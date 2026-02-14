import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Header } from '@/components/menu/Header';
import ProfileSidebar from '@/app/(profile)/[@username]/ProfileSidebar';
import ProfileHeader from './ProfileHeader';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        '@username': string;
    }>;
}

export default async function ProfileLayout({ children, params }: LayoutProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    const session = await getSession();
    const currentUserId = session ? parseInt(session.id) : null;
    const currentUser = currentUserId ? await prisma.user.findUnique({ where: { id: currentUserId } }) : null;

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const user = await prisma.user.findUnique({
        where: { username: decoded }
    });

    if (!user) return notFound();

    const isOwner = session?.id === user.id.toString();

    // Fetch stats for sidebar
    const listingsCount = await prisma.property.count({
        where: { listedById: user.id }
    });

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Header user={currentUser} />

            {/* Profile Header (Cover, Info, Tabs) */}
            <ProfileHeader user={user} isOwner={isOwner} />

            <div className="layout-container profile-main-grid">
                {/* Persistent Sidebar */}
                <ProfileSidebar user={user} listingsCount={listingsCount} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
