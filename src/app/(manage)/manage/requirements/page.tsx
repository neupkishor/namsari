import React from 'react';
import prisma from '@/lib/prisma';
import RequirementsListClient from './RequirementsListClient';

export default async function ManageRequirementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [requirements, totalCount] = await Promise.all([
        prisma.requirement.findMany({
            include: { user: { select: { name: true, username: true } } },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        prisma.requirement.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Serialize dates for client
    const serializedRequirements = requirements.map(req => ({
        ...req,
        created_at: req.created_at.toISOString(),
        updated_at: req.updated_at.toISOString()
    }));

    return (
        <RequirementsListClient requirements={serializedRequirements} totalPages={totalPages} />
    );
}
