'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth'; // Assuming next-auth, or custom auth
import { getCurrentUser } from '@/lib/auth'; // Replace with actual auth method
import { cookies } from 'next/headers';

// Helper to calculate date ranges
const getDateRange = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

// Helper to check permission
const hasPermission = (user: any, resource: string, action: string) => {
    if (!user?.role?.permissions) return false;
    // Map action levels to numeric values for comparison
    const actionLevels: Record<string, number> = {
        'view': 1, 'readOnly': 1,
        'create': 2,
        'view&create': 3, 'read&write': 3,
        'view&update': 4,
        'view&create&update': 5,
        'view&create&delete': 6, 'read&write&delete': 6,
        'view&update&delete': 7,
        'view&create&update&delete': 8
    };

    const requiredLevel = actionLevels[action] || 0;
    
    // Check if user has permission for this resource with equal or higher level
    // Actually, the requirement is specific: "admin_property_view" usually implies a specific role or permission set.
    // For simplicity, we will check if the user has ANY permission on the resource that includes 'view' (odd numbers usually in our new scheme, or just existence).
    // But the prompt implies specific "admin_property_view" vs "agency_admin_property_view". 
    // We will infer these from role names or specific permission entries if they existed, 
    // but here we will implement logic based on the user's account type and their role permissions.
    
    const perm = user.role.permissions.find((p: any) => p.resource === resource);
    if (!perm) return false;
    
    const userLevel = actionLevels[perm.action] || 0;
    
    // Simple check: if we ask for 'view', we need level >= 1.
    return userLevel >= requiredLevel;
};

export async function getDashboardStats() {
    const user = await getCurrentUser();
    if (!user) return null;

    // Fetch full user with role and permissions
    const dbUser = await prisma.account.findUnique({
        where: { id: user.id },
        include: {
            role: {
                include: { permissions: true }
            },
            agency: true
        }
    });

    if (!dbUser) return null;

    const stats: any = {};
    const now = new Date();
    const oneDayAgo = getDateRange(1);
    const sevenDaysAgo = getDateRange(7);
    const thirtyDaysAgo = getDateRange(30);

    // --- Property Stats ---
    // Section 1: My Properties (Always visible for logged in users)
    const myProperties = await prisma.property.count({ where: { listedById: dbUser.id } });
    
    // Section 2: Agency Properties (Visible if agency admin)
    let agencyProperties = 0;
    if (dbUser.type === 'agency') {
        const agents = await prisma.account.findMany({
            where: { agency_id: dbUser.id },
            select: { id: true }
        });
        const agentIds = agents.map(a => a.id);
        agencyProperties = await prisma.property.count({
            where: {
                OR: [
                    { listedById: dbUser.id },
                    { listedById: { in: agentIds } }
                ]
            }
        });
    }

    // Section 3: All Properties (Visible if Admin)
    const isAdmin = dbUser.role?.name?.toLowerCase().includes('admin') || false;
    let allProperties = 0;
    if (isAdmin) {
        allProperties = await prisma.property.count();
    }

    stats.properties = {
        my: myProperties,
        agency: agencyProperties,
        all: allProperties,
        // Detailed breakdown for the primary view (highest permission)
        // We keep the old breakdown logic but apply it to the most relevant scope
        // If Admin -> All, If Agency -> Agency, Else -> My
        total: isAdmin ? allProperties : (dbUser.type === 'agency' ? agencyProperties : myProperties)
    };

    // Calculate time-based stats for the primary view scope
    let primaryScopeWhere: any = {};
    if (isAdmin) {
        primaryScopeWhere = {};
    } else if (dbUser.type === 'agency') {
        const agents = await prisma.account.findMany({
            where: { agency_id: dbUser.id },
            select: { id: true }
        });
        const agentIds = agents.map(a => a.id);
        primaryScopeWhere = {
            OR: [
                { listedById: dbUser.id },
                { listedById: { in: agentIds } }
            ]
        };
    } else {
        primaryScopeWhere = { listedById: dbUser.id };
    }

    const [
        last30,
        last7,
        last1
    ] = await Promise.all([
        prisma.property.count({ where: { ...primaryScopeWhere, created_on: { gte: thirtyDaysAgo } } }),
        prisma.property.count({ where: { ...primaryScopeWhere, created_on: { gte: sevenDaysAgo } } }),
        prisma.property.count({ where: { ...primaryScopeWhere, created_on: { gte: oneDayAgo } } })
    ]);

    const propertyViews = await prisma.property.aggregate({
        where: primaryScopeWhere,
        _sum: { views: true }
    });

    stats.properties.last30 = last30;
    stats.properties.last7 = last7;
    stats.properties.last1 = last1;
    stats.properties.totalViews = propertyViews._sum.views || 0;


    // --- Requirements Stats ---
    const hasRequirementView = hasPermission(dbUser, 'Property', 'view'); // Using Property as proxy
    
    let reqWhere: any = {};
    if (isAdmin && hasRequirementView) {
        reqWhere = {};
    } else if (dbUser.type === 'agency') {
         const agents = await prisma.account.findMany({
            where: { agency_id: dbUser.id },
            select: { id: true }
        });
        const agentIds = agents.map(a => a.id);
        reqWhere = {
            OR: [
                { userId: dbUser.id },
                { userId: { in: agentIds } }
            ]
        };
    } else {
        reqWhere = { userId: dbUser.id };
    }

    const totalRequirements = await prisma.requirement.count({ where: { ...reqWhere, status: 'active' } });
    stats.requirements = {
        total: totalRequirements
    };

    // --- Featured Stats ---
    const hasFeaturedView = hasPermission(dbUser, 'Featured', 'view');
    let featuredWhere: any = { isFeatured: true };
    
    if (!isAdmin || !hasFeaturedView) {
        // If not admin, show only own featured properties
         if (dbUser.type === 'agency') {
            const agents = await prisma.account.findMany({
                where: { agency_id: dbUser.id },
                select: { id: true }
            });
            const agentIds = agents.map(a => a.id);
            featuredWhere = {
                isFeatured: true,
                OR: [
                    { listedById: dbUser.id },
                    { listedById: { in: agentIds } }
                ]
            };
        } else {
            featuredWhere = { isFeatured: true, listedById: dbUser.id };
        }
    }

    const totalFeatured = await prisma.property.count({ where: featuredWhere });
    stats.featured = {
        total: totalFeatured
    };

    // --- Collections ---
    const hasCollectionView = hasPermission(dbUser, 'Collection', 'view');
    if (hasCollectionView) {
        const totalCollections = await prisma.collection.count();
        stats.collections = { total: totalCollections };
    }

    // --- Advertisements ---
    const hasAdView = hasPermission(dbUser, 'Advertisement', 'view');
    let adWhere: any = { is_active: true };
    
    if (!isAdmin || !hasAdView) {
        adWhere = {
            is_active: true,
            posted_by: dbUser.username 
        };
    }

    const [totalAds, adViewsAgg] = await Promise.all([
        prisma.advertisement.count({ where: adWhere }),
        prisma.advertisement.aggregate({
            where: adWhere,
            _sum: { views: true }
        })
    ]);
    
    stats.advertisements = {
        total: totalAds,
        totalViews: adViewsAgg._sum.views || 0
    };


    // --- Newsletter ---
    const hasNewsletterView = isAdmin; 
    if (hasNewsletterView) {
        const [
            totalSubs,
            subsLast30,
            subsLast7,
            subsLast1
        ] = await Promise.all([
            prisma.subscriber.count({ where: { isActive: true } }),
            prisma.subscriber.count({ where: { isActive: true, createdAt: { gte: thirtyDaysAgo } } }),
            prisma.subscriber.count({ where: { isActive: true, createdAt: { gte: sevenDaysAgo } } }),
            prisma.subscriber.count({ where: { isActive: true, createdAt: { gte: oneDayAgo } } })
        ]);
        stats.newsletter = {
            total: totalSubs,
            last30: subsLast30,
            last7: subsLast7,
            last1: subsLast1
        };
    }

    // --- User Management ---
    const hasUserView = hasPermission(dbUser, 'User', 'view');
    if (hasUserView) {
        const [
            totalUsers,
            usersLast30,
            usersLast7,
            usersLast1,
            totalAgency,
            totalAgent, // Independent
            totalAgencyAgent // Linked to agency
        ] = await Promise.all([
            prisma.account.count(),
            prisma.account.count({ where: { created_on: { gte: thirtyDaysAgo } } }),
            prisma.account.count({ where: { created_on: { gte: sevenDaysAgo } } }),
            prisma.account.count({ where: { created_on: { gte: oneDayAgo } } }),
            prisma.account.count({ where: { type: 'agency' } }),
            prisma.account.count({ where: { type: { in: ['agent', 'user'] }, agency_id: null } }), // Assuming 'agent' or default 'user'
            prisma.account.count({ where: { agency_id: { not: null } } })
        ]);
        
        // Banks count
        const totalBanks = await prisma.bank.count();

        stats.users = {
            total: totalUsers,
            last30: usersLast30,
            last7: usersLast7,
            last1: usersLast1,
            agency: totalAgency,
            agent: totalAgent,
            agencyAgent: totalAgencyAgent,
            bank: totalBanks
        };
    }

    // --- Webmaster (Visitors) ---
    // Only Admin
    if (isAdmin) {
        const [
            totalVisits,
            visits30,
            visits7,
            visits1
        ] = await Promise.all([
            prisma.visitor.count(),
            prisma.visitor.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
            prisma.visitor.count({ where: { created_at: { gte: sevenDaysAgo } } }),
            prisma.visitor.count({ where: { created_at: { gte: oneDayAgo } } })
        ]);
        
        // Count unique visitors (by session_id) - approximate
        const uniqueVisitors = await prisma.visitor.groupBy({
            by: ['session_id'],
            where: { created_at: { gte: thirtyDaysAgo } },
        });
        
        stats.webmaster = {
            totalVisits,
            visits30,
            visits7,
            visits1,
            uniqueVisitors30: uniqueVisitors.length
        };
    }

    // --- Career ---
    const hasCareerView = hasPermission(dbUser, 'Career', 'view');
    if (hasCareerView) {
        const totalJobs = await prisma.jobListing.count();
        const activeJobs = await prisma.jobListing.count({ where: { status: 'open' } });
        // Applicants on active jobs
        const activeJobIds = await prisma.jobListing.findMany({ 
            where: { status: 'open' }, 
            select: { id: true } 
        });
        const activeIds = activeJobIds.map(j => j.id);
        const totalApplicants = await prisma.jobApplication.count({
            where: { application_for_id: { in: activeIds } }
        });
        
        stats.career = {
            total: totalJobs,
            active: activeJobs,
            applicants: totalApplicants
        };
    }

    // --- Support ---
    const hasSupportView = hasPermission(dbUser, 'Support', 'view');
    if (hasSupportView) {
        const tenDaysAgo = getDateRange(10);
        const totalArticles = await prisma.supportArticle.count();
        const publishedLast10 = await prisma.supportArticle.count({
            where: { status: 'published', created_at: { gte: tenDaysAgo } }
        });
        
        stats.support = {
            total: totalArticles,
            publishedLast10
        };
    }

    // --- Blog ---
    const hasBlogView = hasPermission(dbUser, 'Blog', 'view');
    if (hasBlogView) {
        const tenDaysAgo = getDateRange(10);
        const totalPosts = await prisma.blogPost.count();
        const publishedLast10 = await prisma.blogPost.count({
            where: { status: 'published', created_at: { gte: tenDaysAgo } }
        });
        stats.blog = {
            total: totalPosts,
            publishedLast10
        };
    }

    // --- Bank Specific ---
    if (isAdmin || hasPermission(dbUser, 'Bank', 'view')) {
         const banks = await prisma.bank.findMany({
             include: {
                 rates: {
                     orderBy: { created_at: 'desc' },
                     take: 1
                 }
             }
         });
         
         stats.banks = banks.map(b => ({
             name: b.name,
             currentRate: b.rates[0]?.interest || 'N/A',
             lastChange: b.rates[0]?.created_at || 'N/A'
         }));
    }

    return { stats, user: dbUser };
}
