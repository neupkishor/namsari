import prisma from '@/lib/prisma';
import NewsletterClient from './NewsletterClient';

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
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

    const serializedSubscribers = subscribers.map(sub => ({
        ...sub,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString()
    }));

    return <NewsletterClient subscribers={serializedSubscribers} totalPages={totalPages} totalCount={totalCount} />;
}
