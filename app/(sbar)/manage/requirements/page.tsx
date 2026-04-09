import React from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import RequirementsListClient from '@/app/(sbar)/manage/requirements/RequirementsListClient';
import { redirect } from 'next/navigation';

export default async function ManageRequirementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const session = await getSession();
    if (!session) redirect('/auth/login');

    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Determine query conditions based on user type
    let where: any = {};
    const isAdmin = session.type === 'admin';
    const isAgency = session.type === 'agency' || session.operatingId;
    const isAgent = session.type === 'agent' || session.type === 'agency_agent';

    if (!isAdmin) {
        if (isAgency || isAgent) {
            const userId = session.operatingId || parseInt(session.id);
            let memberIds: number[] = [userId];

            if (isAgency) {
                // Fetch members using `any` cast to avoid type errors with recent schema changes
                const members = await (prisma as any).member.findMany({ where: { partOf: userId } });
                memberIds = [...memberIds, ...members.map((m: any) => m.accountId)];
            } else if (isAgent) {
                const user = await prisma.user.findUnique({ 
                    where: { id: parseInt(session.id) }, 
                    include: { memberships: true } as any 
                });
                // Cast user to any to access memberships
                const userAny = user as any;
                const agencyId = userAny?.agency_id || userAny?.memberships?.[0]?.partOf;
                
                if (agencyId) {
                     const members = await (prisma as any).member.findMany({ where: { partOf: agencyId } });
                     memberIds = [...members.map((m: any) => m.accountId), agencyId];
                }
            }

            where = {
                OR: [
                    { is_public: true },
                    { 
                        is_public: false,
                        userId: { in: memberIds }
                    }
                ]
            };
        } else {
            // Normal user: See Public + Own Private
            where = {
                OR: [
                    { is_public: true },
                    { userId: parseInt(session.id) }
                ]
            };
        }
    }

    const [requirements, totalCount] = await Promise.all([
        prisma.requirement.findMany({
            where,
            include: { user: { select: { name: true, username: true } } },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        }),
        prisma.requirement.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Serialize dates for client
    const serializedRequirements = requirements.map((req: any) => ({
        ...req,
        created_at: req.created_at.toISOString(),
        updated_at: req.updated_at.toISOString(),
        userId: req.userId // Ensure userId is passed
    }));

    return (
        <RequirementsListClient 
            requirements={serializedRequirements} 
            totalPages={totalPages} 
            currentUserId={parseInt(session.id)}
        />
    );
}
