import prisma from '@/lib/prisma';

export async function getBrowseProperties(limit = 60) {
    const dbProperties = await prisma.property.findMany({
        include: {
            listedBy: {
                include: {
                    _count: { select: { listedProperties: true } }
                }
            },
            location: true,
            pricing: true,
            images: true,
            types: true,
            features: true,
            comments: {
                include: { user: true },
                orderBy: { created_at: 'asc' }
            },
            property_likes: true
        },
        orderBy: { created_on: 'desc' },
        take: limit
    });

    return dbProperties.map((property: any) => {
        const priceValue = property.pricing?.price || 0;

        const formattedPrice = new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            maximumFractionDigits: 0
        }).format(Number(priceValue)).replace('NPR', 'NRs.');

        const locationStr = property.location
            ? `${property.location.area}, ${property.location.district}`
            : 'Unspecified';

        const specs = property.features
            ? `${property.features.bedrooms || 0}BHK • ${property.features.bathrooms || 0} Bath • ${property.features.builtUpArea || 0} ${property.features.builtUpAreaUnit || ''}`
            : 'Details unspecified';

        return {
            ...property,
            price: formattedPrice,
            location: locationStr,
            latitude: property.location?.latitude,
            longitude: property.location?.longitude,
            images: property.images.map((img: any) => img.url),
            property_types: property.types.map((type: any) => type.name),
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