import HomeClient from './HomeClient';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getActiveAdvertisements } from '@/actions/advertisements';

export default async function HomePage() {
    const session = await getSession();

    let user = null;

    if (session?.id) {
        try {
            user = await prisma.user.findUnique({
                where: { id: Number(session.id) }
            });
        } catch (e) {
            console.error("Failed to fetch user", e);
        }
    }

    const [featuredCollections, trendingSearches, featuredProperties, featuredAgencies, advertisements] = await Promise.all([
        prisma.collection.findMany({
            where: { is_public: true },
            take: 6,
            orderBy: { updated_at: 'desc' },
            include: {
                properties: {
                    take: 1,
                    include: {
                        property: {
                            select: { images: { take: 1, select: { url: true } } }
                        }
                    }
                }
            }
        }),
        import('@/actions/search').then(mod => mod.getTrendingSearches()),
        prisma.property.findMany({
            where: { isFeatured: true },
            take: 4,
            include: {
                listedBy: true,
                location: true,
                pricing: true,
                images: true,
                types: true,
                features: true
            },
            orderBy: { created_on: 'desc' }
        }),
        prisma.user.findMany({
            where: { type: 'agency' },
            take: 10,
            orderBy: { created_on: 'desc' },
            include: {
                _count: {
                    select: { listedProperties: true }
                }
            }
        }),
        getActiveAdvertisements()
    ]);

    return <HomeClient
        user={user}
        featuredCollections={featuredCollections}
        trendingSearches={trendingSearches}
        featuredProperties={featuredProperties}
        featuredAgencies={featuredAgencies}
        advertisements={advertisements}
    />;
}