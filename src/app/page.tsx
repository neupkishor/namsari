import HomeClient from './HomeClient';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function HomePage() {
    const [session, settings] = await Promise.all([
        getSession(),
        (prisma as any).systemSettings.findFirst() ||
        (prisma as any).systemSettings.create({
            data: {
                id: 1,
                view_mode: 'classic',
                show_like_button: true,
                show_share_button: true,
                show_comment_button: true,
                show_contact_agent: true,
                show_make_offer: true
            }
        })
    ]);

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

    const [featuredCollections, trendingSearches, featuredProperties] = await Promise.all([
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
        import('./actions/search').then(mod => mod.getTrendingSearches()),
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
        })
    ]);

    return <HomeClient
        user={user}
        settings={settings}
        featuredCollections={featuredCollections}
        trendingSearches={trendingSearches}
        featuredProperties={featuredProperties}
    />;
}
