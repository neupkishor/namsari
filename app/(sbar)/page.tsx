
import HomeClient from './HomeClient';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getActiveAdvertisements } from '@/services/advertisements/actions';
import { getPropertyTypeCounts, getSiteSettings } from '@/services/site/settings';
import { getCachedListingStats } from '@/services/properties/listing-stats';
import { legacyPricingFromProperty } from '@/lib/pricing';

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
                            select: {
                                propertyMedia: {
                                    take: 1,
                                    orderBy: { index: 'asc' },
                                },
                            }
                        }
                    }
                }
            }
        }),
        import('@/services/search/actions').then(mod => mod.getTrendingSearches()),
        prisma.property.findMany({
            where: { isFeatured: true, price_listed: { not: null } },
            take: 4,
            include: {
                listedBy: true,
                location: true,
                natures: true,
                features: true,
                propertyMedia: {
                    take: 4,
                    orderBy: { index: 'asc' },
                }
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
    const featuredPropertiesWithLegacyPricing = featuredProperties.map((property: any) => {
        const numericPrice = Number(property.price_listed || 0);
        const hasNumericPrice = numericPrice > 0;
        return {
            ...property,
            price: hasNumericPrice ? String(numericPrice) : '',
            pricing: hasNumericPrice
                ? legacyPricingFromProperty(property)
                : null,
        };
    });

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
