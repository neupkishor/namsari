import React from 'react';
import prisma from '@/lib/prisma';
import FeaturedManagementClient from './FeaturedManagementClient';

export default async function FeaturedManagementPage() {
    const properties = await prisma.property.findMany({
        orderBy: { created_on: 'desc' }
    });

    const serializedProperties = properties.map(p => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    }));

    return <FeaturedManagementClient properties={serializedProperties} />;
}
