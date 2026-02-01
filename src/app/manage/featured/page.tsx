import React from 'react';
import prisma from '@/lib/prisma';
import FeaturedManagementClient from './FeaturedManagementClient';

export default async function FeaturedManagementPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [properties, totalCount] = await Promise.all([
        prisma.property.findMany({
            include: {
                location: true,
                images: true
            },
            orderBy: { created_on: 'desc' },
            skip,
            take: limit
        }),
        prisma.property.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const serializedProperties = properties.map(p => ({
        ...p,
        location: p.location ? `${p.location.area}, ${p.location.district}` : 'Unspecified',
        images: p.images.map(img => img.url),
    }));

    return <FeaturedManagementClient properties={serializedProperties} totalPages={totalPages} />;
}
