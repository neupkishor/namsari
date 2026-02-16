import prisma from '@/lib/prisma';
import NewsletterClient from '@/app/(sbar)/manage/newsletter/NewsletterClient';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const user = await getCurrentUser();
    if (!user || (user.type !== 'admin' && !user.type?.includes('admin')) || user.operatingId) {
        redirect('/manage');
    }

    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [subscribers, totalCount] = await Promise.all([
        prisma.subscriber.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.subscriber.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const serializedSubscribers = subscribers.map((sub: any) => ({
        ...sub,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString()
    }));

    return <NewsletterClient subscribers={serializedSubscribers} totalPages={totalPages} totalCount={totalCount} />;
}
