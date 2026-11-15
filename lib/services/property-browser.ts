import prisma from '@/lib/prisma';
import { legacyPricingFromProperty } from '@/lib/pricing';

export async function getBrowseProperties(limit = 60, options?: { onlyMappable?: boolean; pricedOnly?: boolean }) {
    const onlyMappable = options?.onlyMappable === true;
    const pricedOnly = options?.pricedOnly !== false;

    const dbProperties = await prisma.property.findMany({
        where: {
            ...(pricedOnly ? { price_listed: { not: null } } : {}),
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
        orderBy: { created_on: 'desc' },
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
