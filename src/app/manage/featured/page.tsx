import React from 'react';
import prisma from '@/lib/prisma';
import FeaturedManagementClient from './FeaturedManagementClient';

export default async function FeaturedManagementPage() {
    const properties = await prisma.property.findMany({
        include: {
            location: true,
            images: true
        },
        orderBy: { created_on: 'desc' }
    });

    const serializedProperties = properties.map(p => ({
        ...p,
        location: p.location ? `${p.location.area}, ${p.location.district}` : 'Unspecified',
        images: p.images.map(img => img.url),
    }));

    return <FeaturedManagementClient properties={serializedProperties} />;
}
