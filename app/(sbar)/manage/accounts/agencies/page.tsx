import React from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import AgencyManagementClient from './AgencyManagementClient';

export default async function AgencyManagementPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const session = await getSession();
    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;

    if (!session?.id) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Please log in to manage agencies.
            </div>
        );
    }

    const userId = parseInt(session.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    if (!user) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                User account not found.
            </div>
        );
    }

    // Check for admin/management permissions
    // Assuming 'admin' type or 'admin' role has access to all agencies
    const isAdmin = user.type === 'admin' || user.role?.role?.toLowerCase().includes('admin');

    // Restrict access if operating as switched account (even if admin)
    if (session.operatingId) {
        return (
             <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Access restricted in switched view.
            </div>
        );
    }

    // 1. Fetch "Your Agencies" - Agencies the user has permissions to
    const yourPermissions = await prisma.userPermission.findMany({
        where: {
            actorId: userId,
            owner: { type: 'agency' }
        },
        include: { owner: true }
    });
    const yourAgencies = yourPermissions.map(p => p.owner);

    // 2. Fetch "All Agencies" - Only if user has admin permissions
    let allAgencies: any[] = [];
    let totalCount = 0;

    if (isAdmin) {
        const limit = 10;
        const skip = (page - 1) * limit;
        const where = { type: 'agency' };

        [allAgencies, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ]);
    }

    const totalPages = Math.ceil(totalCount / 10);

    return (
        <AgencyManagementClient 
            yourAgencies={yourAgencies} 
            allAgencies={allAgencies}
            showAllAgencies={isAdmin || false}
            canCreateAgency={isAdmin || false}
            totalPages={totalPages}
        />
    );
}
