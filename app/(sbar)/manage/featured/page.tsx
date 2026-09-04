import React from 'react';
import prisma from '@/lib/prisma';
import FeaturedManagementClient from '@/app/(sbar)/manage/featured/FeaturedManagementClient';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function FeaturedManagementPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const user = await getCurrentUser();
    
    if (!user) {
        redirect('/auth/login');
    }

    if (user.type !== 'admin' && !user.role?.role?.toLowerCase().includes('admin')) {
        redirect('/manage');
    }

    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [properties, totalCount] = await Promise.all([
        prisma.property.findMany({
            include: {
                location: true,
                propertyMedia: true
            },
            orderBy: { created_on: 'desc' },
            skip,
            take: limit
        }),
        prisma.property.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const serializedProperties = properties.map((p: any) => ({
        ...p,
        location: p.location ? `${p.location.area}, ${p.location.district}` : 'Unspecified',
        images: p.propertyMedia.map((img: any) => img.resourceUrl),
    }));

    return <FeaturedManagementClient properties={serializedProperties} totalPages={totalPages} />;
}
