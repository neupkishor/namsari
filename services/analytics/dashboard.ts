'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser, getSession } from '@/lib/auth';

type DashboardAgency = { id: number; type: string };
type DashboardBank = {
    name: string;
    rates: Array<{ interest: unknown; created_at: Date }>;
};

// Helper to calculate date ranges
const getDateRange = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

// Helper to fetch stats for a specific scope (User, Agency, or Admin/Global)
async function fetchScopeStats(whereConditions: any, scopeType: 'user' | 'agency' | 'admin') {
    const thirtyDaysAgo = getDateRange(30);
    const sevenDaysAgo = getDateRange(7);
    const oneDayAgo = getDateRange(1);

    // --- Property Stats ---
    const totalProperties = await prisma.property.count({ where: whereConditions.property });
    
    const [last30, last7, last1] = await Promise.all([
        prisma.property.count({ where: { ...whereConditions.property, created_on: { gte: thirtyDaysAgo } } }),
        prisma.property.count({ where: { ...whereConditions.property, created_on: { gte: sevenDaysAgo } } }),
        prisma.property.count({ where: { ...whereConditions.property, created_on: { gte: oneDayAgo } } })
    ]);

    const propertyViews = await prisma.property.aggregate({
        where: whereConditions.property,
        _sum: { views: true }
    });

    const propertyStats = {
        my: scopeType === 'user' ? totalProperties : 0,
        agency: scopeType === 'agency' ? totalProperties : 0,
        all: scopeType === 'admin' ? totalProperties : 0,
        total: totalProperties,
        last30,
        last7,
        last1,
        totalViews: propertyViews._sum.views || 0
    };

    // --- Requirements Stats ---
    const totalRequirements = await prisma.requirement.count({ where: { ...whereConditions.requirement, status: 'active' } });
    const publicRequirements = await prisma.requirement.count({ where: { ...whereConditions.requirement, status: 'active', is_public: true } });
    const privateRequirements = await prisma.requirement.count({ where: { ...whereConditions.requirement, status: 'active', is_public: false } });
    
    const requirementStats = { 
        total: totalRequirements,
        public: publicRequirements,
        private: privateRequirements
    };

    // --- Featured Stats ---
    const totalFeatured = await prisma.property.count({ where: { ...whereConditions.property, isFeatured: true } });
    const featuredStats = { total: totalFeatured };

    // --- Collections ---
    let collectionStats = null;
    if (scopeType === 'admin') {
         const total = await prisma.collection.count();
         collectionStats = { total };
    } else if (scopeType === 'user' || scopeType === 'agency') {
         const total = await prisma.collection.count({ where: { user_id: whereConditions.requirement.userId } });
         collectionStats = { total };
    }

    // --- Advertisements ---
    let adStats = null;
    if (scopeType === 'admin') {
         const totalAds = await prisma.advertisement.count({ where: { status: 'active' } as any });
         const adViews = await prisma.advertisement.aggregate({ where: { status: 'active' } as any, _sum: { views: true } });
         adStats = { total: totalAds, totalViews: adViews._sum?.views || 0 };
    } else if (scopeType === 'agency') {
         // Agency's own advertisements
         const totalAds = await prisma.advertisement.count({ where: { userId: whereConditions.requirement.userId } as any });
         const adViews = await prisma.advertisement.aggregate({ where: { userId: whereConditions.requirement.userId } as any, _sum: { views: true } });
         adStats = { total: totalAds, totalViews: adViews._sum?.views || 0 };
    }

    // --- Agents (Agency Only) ---
    let agentStats = null;
    if (scopeType === 'agency') {
        // whereConditions.requirement.userId usually has { in: [...] } or direct ID
        // But better to pass agency ID explicitly or derive it. 
        // In getDashboardStats loop, we know the agency object.
        // We can pass it into fetchScopeStats or return it separately.
        // For now, let's keep fetchScopeStats generic and handle agent count outside or infer from context?
        // Actually, let's return it as null here and handle in the main function loop for agency.
    }

    return {
        properties: propertyStats,
        requirements: requirementStats,
        featured: featuredStats,
        collections: collectionStats,
        advertisements: adStats
    };
}

export async function getDashboardStats() {
    const session = await getSession();
    if (!session?.id) return null;
    const userId = parseInt(session.id);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            role: true,
            agency: true
        }
    });

    if (!user) return null;

    // 1. User Stats (Personal)
    const userStats = await fetchScopeStats({
        property: { listedById: userId },
        requirement: { userId: userId }
    }, 'user');

    // 2. Agency Stats
    // Find agencies this user manages
    const permissions = await prisma.userPermission.findMany({
        where: { actorId: userId, owner: { type: 'agency' } },
        include: { owner: true }
    });
    
    let agencies: DashboardAgency[] = permissions.map((p: { owner: DashboardAgency }) => p.owner);
    // If user is agency, include self if not already in list
    if (user.type === 'agency' && !agencies.find(a => a.id === user.id)) {
        agencies.push(user);
    }

    const agenciesStats = await Promise.all(agencies.map(async (agency: DashboardAgency) => {
        // Find all agents of this agency
        const agents = await prisma.user.findMany({
            where: { agency_id: agency.id },
            select: { id: true }
        });
        const agentIds = agents.map((a: { id: number }) => a.id);
        const memberIds = [agency.id, ...agentIds];

        const stats = await fetchScopeStats({
            property: { listedById: { in: memberIds } },
            requirement: { userId: { in: memberIds } }
        }, 'agency');

        return {
            agency,
            agentCount: agents.length,
            stats
        };
    }));

    // 3. Admin Stats
    let adminStats = null;
    const isAdmin = user.type === 'admin' || user.role?.role?.toLowerCase().includes('admin');
    
    if (isAdmin) {
        // Admin View includes Global Stats
        const baseStats = await fetchScopeStats({
            property: {},
            requirement: {}
        }, 'admin');

        // Add extra admin-only stats (Users, Webmaster, etc.)
        const thirtyDaysAgo = getDateRange(30);
        const sevenDaysAgo = getDateRange(7);
        const oneDayAgo = getDateRange(1);

        // User Management
        const [
            totalUsers, usersLast30, usersLast7, usersLast1,
            totalAgency, totalAgent, totalAgencyAgent, totalBanks
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { created_on: { gte: thirtyDaysAgo } } }),
            prisma.user.count({ where: { created_on: { gte: sevenDaysAgo } } }),
            prisma.user.count({ where: { created_on: { gte: oneDayAgo } } }),
            prisma.user.count({ where: { type: 'agency' } }),
            prisma.user.count({ where: { type: { in: ['agent', 'user'] }, agency_id: null } }),
            prisma.user.count({ where: { agency_id: { not: null } } }),
            prisma.bank.count()
        ]);

        const userManagementStats = {
            total: totalUsers,
            last30: usersLast30, last7: usersLast7, last1: usersLast1,
            agency: totalAgency, agent: totalAgent, agencyAgent: totalAgencyAgent, bank: totalBanks
        };

        // Webmaster
        const totalVisitsGroup = await prisma.visitor.groupBy({ by: ['session_id'] });
        const visits30Group = await prisma.visitor.groupBy({ by: ['session_id'], where: { created_at: { gte: thirtyDaysAgo } } });
        const uniqueVisitorsGroup = await prisma.visitor.groupBy({ by: ['ip_address'], where: { created_at: { gte: thirtyDaysAgo } } });

        const webmasterStats = {
            totalVisits: totalVisitsGroup.length,
            visits30: visits30Group.length,
            visits7: (await prisma.visitor.groupBy({ by: ['session_id'], where: { created_at: { gte: sevenDaysAgo } } })).length,
            visits1: (await prisma.visitor.groupBy({ by: ['session_id'], where: { created_at: { gte: oneDayAgo } } })).length,
            uniqueVisitors30: uniqueVisitorsGroup.length
        };

        // Newsletter
        const totalSubs = await prisma.subscriber.count({ where: { isActive: true } });
        const newsletterStats = {
            total: totalSubs,
            last30: await prisma.subscriber.count({ where: { isActive: true, createdAt: { gte: thirtyDaysAgo } } }),
            last7: await prisma.subscriber.count({ where: { isActive: true, createdAt: { gte: sevenDaysAgo } } }),
            last1: await prisma.subscriber.count({ where: { isActive: true, createdAt: { gte: oneDayAgo } } })
        };

        // Banks
         const banks = await prisma.bank.findMany({
             include: { rates: { orderBy: { created_at: 'desc' }, take: 1 } }
         });
         const bankStats = banks.map((b: DashboardBank) => ({
             name: b.name,
             currentRate: b.rates[0]?.interest || 'N/A',
             lastChange: b.rates[0]?.created_at || 'N/A'
         }));

        adminStats = {
            ...baseStats,
            users: userManagementStats,
            webmaster: webmasterStats,
            newsletter: newsletterStats,
            banks: bankStats
        };
    }

    return {
        user: { ...user, operatingId: session.operatingId },
        userStats,
        agenciesStats,
        adminStats
    };
}
