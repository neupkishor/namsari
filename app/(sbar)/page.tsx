
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
        import('@/actions/search').then(mod => mod.getTrendingSearches()),
        prisma.property.findMany({
            where: { isFeatured: true, propertyPrices: { some: {} } },
            take: 4,
            include: {
                listedBy: true,
                location: true,
                propertyPrices: {
                    where: { isDefault: true },
                    take: 1,
                },
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
        const storedPrice = property.propertyPrices?.[0];
        // `base` stores the pricing basis (for example, `flatPrice`), not the
        // amount. The amount used by the homepage is stored in `display`.
        const displayPrice = typeof storedPrice?.display === 'string'
            ? storedPrice.display.trim()
            : '';
        const numericPrice = Number(displayPrice.replace(/[^0-9.]/g, ''));
        const hasNumericPrice = displayPrice.length > 0 && Number.isFinite(numericPrice);
        const pricingBase = String(storedPrice?.base || '');
        // Homepage cards intentionally omit the unit (for example, “per aana”).
        // Keep the monthly qualifier for flat monthly prices.
        const displayRate = pricingBase.includes('PerMonth') ? 'perMonth' : 'total';

        return {
            ...property,
            price: displayPrice || '',
            pricing: hasNumericPrice
                ? legacyPricingFromPrice({
                    price: numericPrice,
                    rate: displayRate,
                })
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
