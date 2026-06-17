
import HomeClient from './HomeClient';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getActiveAdvertisements } from '@/actions/advertisements';
import { getPropertyTypeCounts, getSiteSettings } from '@/actions/settings';
import { getCachedListingStats } from '@/actions/listing-stats';
import { legacyPricingFromPrice } from '@/lib/pricing';

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

    const [featuredCollections, trendingSearches, featuredProperties, featuredAgencies, advertisements, propertyTypes, cachedListingStats, siteSettings] = await Promise.all([
        prisma.collection.findMany({
            where: { is_public: true },
            take: 12,
            orderBy: { updated_at: 'desc' },
            include: {
                _count: {
                    select: { properties: true }
                },
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
                images: true,
                types: true,
                natures: true,
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
        getActiveAdvertisements(),
        getPropertyTypeCounts(),
        getCachedListingStats(),
        getSiteSettings()
    ]);

    const exploreCategoryStats = cachedListingStats.stats;
    const featuredPropertiesWithLegacyPricing = featuredProperties.map((property: any) => ({
        ...property,
        pricing: legacyPricingFromPrice(property.price as any),
    }));

    const categories = propertyTypes.map(pt => ({
        id: String(pt.id),
        name: pt.name,
        count: pt.propertyCount || 0,
        icon: '' // Will be resolved by helper
    }));

    return <HomeClient
        user={user}
        featuredCollections={featuredCollections}
        trendingSearches={trendingSearches}
        featuredProperties={featuredPropertiesWithLegacyPricing}
        featuredAgencies={featuredAgencies}
        advertisements={advertisements}
        categories={categories}
        exploreCategoryStats={exploreCategoryStats}
        siteSettings={siteSettings}
    />;
}
