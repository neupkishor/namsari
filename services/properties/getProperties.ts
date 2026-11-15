import prisma from '@/lib/prisma';
import { legacyPricingFromProperty } from '@/lib/pricing';
import type { PropertyType } from '@prisma/client';
import type { PropertyFilterPayload } from './filterPayload';

// Loads property listings using the shared domain filter payload.
export async function getProperties(filterPayload: PropertyFilterPayload = {}) {
    const onlyMappable = filterPayload.onlyMappable === true;
    const pricedOnly = filterPayload.pricedOnly !== false;
    const limit = filterPayload.limit ?? 60;
    const locationFilters = filterPayload.locations?.filter(Boolean) ?? [];

    const dbProperties = await prisma.property.findMany({
        where: {
            ...(pricedOnly ? { price_listed: { not: null } } : {}),
            ...((filterPayload.query || locationFilters.length) ? { AND: [
                ...(filterPayload.query ? [{ OR: [
                    { title: { contains: filterPayload.query, mode: 'insensitive' as const } },
                    { location: { is: { area: { contains: filterPayload.query, mode: 'insensitive' as const } } } },
                    { location: { is: { cityVillage: { contains: filterPayload.query, mode: 'insensitive' as const } } } },
                    { location: { is: { district: { contains: filterPayload.query, mode: 'insensitive' as const } } } },
                ] }] : []),
                ...(locationFilters.length ? [{ OR: locationFilters.map((location) => ({
                    location: { is: {
                        OR: [
                            { area: { contains: location, mode: 'insensitive' as const } },
                            { cityVillage: { contains: location, mode: 'insensitive' as const } },
                            { district: { contains: location, mode: 'insensitive' as const } },
                        ],
                    } },
                })) }] : []),
            ] } : {}),
            ...(filterPayload.types?.length ? { types: { hasSome: filterPayload.types as PropertyType[] } } : {}),
            ...(filterPayload.category ? { natures: { some: { name: { equals: filterPayload.category, mode: 'insensitive' as const } } } } : {}),
            ...(filterPayload.minPrice !== undefined || filterPayload.maxPrice !== undefined ? { price_listed: { ...(filterPayload.minPrice !== undefined ? { gte: filterPayload.minPrice } : {}), ...(filterPayload.maxPrice !== undefined ? { lte: filterPayload.maxPrice } : {}) } } : {}),
            ...(filterPayload.listedBy ? { listedBy: { type: filterPayload.listedBy } } : {}),
            ...(filterPayload.minSize !== undefined || filterPayload.maxSize !== undefined ? { features: { is: {
                builtUpArea: {
                    ...(filterPayload.minSize !== undefined ? { gte: filterPayload.minSize } : {}),
                    ...(filterPayload.maxSize !== undefined ? { lte: filterPayload.maxSize } : {}),
                },
                ...(filterPayload.sizeUnit ? { builtUpAreaUnit: filterPayload.sizeUnit } : {}),
            } } } : {}),
            ...(onlyMappable ? { OR: [
                {
                    location: {
                        is: {
                            latitude: { not: null },
                            longitude: { not: null }
                        }
                    }
                },
                {
                    openHouse: {
                        is: {
                            latitude: { not: null },
                            longitude: { not: null }
                        }
                    }
                }
            ] } : {}),
        },
        include: {
            listedBy: {
                include: {
                    _count: { select: { listedProperties: true } }
                }
            },
            location: true,
            openHouse: true,
            propertyMedia: { orderBy: { index: 'asc' } },
            natures: true,
            features: true,
            comments: {
                include: { user: true },
                orderBy: { created_at: 'asc' }
            },
            property_likes: true
        },
        orderBy: filterPayload.sortBy === 'price' ? { price_listed: 'asc' } : { created_on: 'desc' },
        take: limit,
    });

    return dbProperties.map((property: any) => {
        const listedPrice = property.price_listed == null ? null : Number(property.price_listed);
        const latitude = property.location?.latitude ?? property.openHouse?.latitude ?? null;
        const longitude = property.location?.longitude ?? property.openHouse?.longitude ?? null;

        const locationStr = property.location
            ? [property.location.area, property.location.cityVillage, property.location.district]
                .filter(Boolean)
                .join(', ')
            : 'Unspecified';

        const specs = property.features
            ? `${property.features.bedrooms || 0}BHK • ${property.features.bathrooms || 0} Bath • ${property.features.builtUpArea || 0} ${property.features.builtUpAreaUnit || ''}`
            : 'Details unspecified';

        return {
            ...property,
            roadSize: property.roadSize == null ? null : Number(property.roadSize),
            price_listed: listedPrice,
            pricing: legacyPricingFromProperty(property),
            price: listedPrice,
            location: locationStr,
            latitude,
            longitude,
            images: (property.propertyMedia || [])
                .filter((media: any) => media.type === 'image')
                .map((media: any) => media.resourceUrl),
            property_types: (property.types || []).map((type: any) => type.name || type),
            property_natures: (property.natures || []).map((nature: any) => nature.name || nature),
            specs,
            author_username: property.listedBy ? property.listedBy.username : null,
            author_name: property.listedBy ? property.listedBy.name : 'Unknown',
            author_avatar: (property.listedBy as any)?.profile_picture || ((property.listedBy as any)?.name || 'U')[0],
            author_phone: (property.listedBy as any)?.contact_number || null,
            timestamp: 'Recently',
            listedBy: property.listedBy ? {
                ...property.listedBy,
                phone: (property.listedBy as any).contact_number || null,
                whatsapp: (property.listedBy as any).contact_number || null,
            } : null,
        };
    });
}
