import React from 'react';
import prisma from '@/lib/prisma';
import AgencyManagementClient from './AgencyManagementClient';

export default async function AgencyManagementPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Fetching agencies from the database
    const [agencies, totalCount] = await Promise.all([
        (prisma as any).agency.findMany({
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        (prisma as any).agency.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <main>
            <AgencyManagementClient agencies={agencies} totalPages={totalPages} />
        </main>
    );
}
