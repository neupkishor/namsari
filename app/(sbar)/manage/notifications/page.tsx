import React from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotificationsList from '@/app/(sbar)/manage/notifications/NotificationsList';
import { PaginationControl } from '@/components/ui';

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const session = await getSession();
    if (!session) redirect('/auth/login');

    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const userId = parseInt(session.id);

    const [notifications, totalCount] = await Promise.all([
        (prisma as any).notification.findMany({
            where: { userId },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        (prisma as any).notification.count({ where: { userId } })
    ]);

    // Mark unread as read (optional behavior: mark all on page load)
    // Or keep them unread until clicked. For now, we just list them.
    // If we want to mark them as read, we should do it via an action or effect.
    
    const totalPages = Math.ceil(totalCount / limit);

    const serializedNotifications = notifications.map((n: any) => ({
        ...n,
        created_at: n.created_at.toISOString()
    }));

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>Notifications</h1>
                <p style={{ color: '#64748b' }}>Stay updated with invites, requests, and system announcements.</p>
            </header>

            <NotificationsList notifications={serializedNotifications} />

            <div style={{ marginTop: '32px' }}>
                <PaginationControl totalPages={totalPages} />
            </div>
        </div>
    );
}
