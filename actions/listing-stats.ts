'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface ListingStats {
    byTypePurpose: {
        house: { sale: number; rent: number };
        land: { sale: number; rent: number };
        building: { sale: number; rent: number };
        apartment: { sale: number; rent: number };
        flat: { sale: number; rent: number };
        business: { sale: number; rent: number };
        commercialSpace: { sale: number; rent: number };
        officeSpace: { sale: number; rent: number };
    };
    forSale: {
        house: number;
        land: number;
        apartment: number;
        business: number;
    };
    forRent: {
        flat: number;
        house: number;
        apartment: number;
        commercialSpace: number;
        officeSpace: number;
        business: number;
        totalRent: number;
    };
    requirements: {
        total: number;
        rental: number;
        purchase: number;
        purchaseByType: {
            house: number;
            land: number;
            apartment: number;
            business: number;
        };
        rentalByType: {
            flat: number;
            house: number;
            apartment: number;
            commercialSpace: number;
            officeSpace: number;
            business: number;
        };
    };
}

interface CachedStatsRow {
    payload: string;
    updated_at: string;
}

const EMPTY_LISTING_STATS: ListingStats = {
    byTypePurpose: {
        house: { sale: 0, rent: 0 },
        land: { sale: 0, rent: 0 },
        building: { sale: 0, rent: 0 },
        apartment: { sale: 0, rent: 0 },
        flat: { sale: 0, rent: 0 },
        business: { sale: 0, rent: 0 },
        commercialSpace: { sale: 0, rent: 0 },
        officeSpace: { sale: 0, rent: 0 },
    },
    forSale: {
        house: 0,
        land: 0,
        apartment: 0,
        business: 0,
    },
    forRent: {
        flat: 0,
        house: 0,
        apartment: 0,
        commercialSpace: 0,
        officeSpace: 0,
        business: 0,
        totalRent: 0,
    },
    requirements: {
        total: 0,
        rental: 0,
        purchase: 0,
        purchaseByType: {
            house: 0,
            land: 0,
            apartment: 0,
            business: 0,
        },
        rentalByType: {
            flat: 0,
            house: 0,
            apartment: 0,
            commercialSpace: 0,
            officeSpace: 0,
            business: 0,
        },
    },
};

function normalizeListingStats(stats?: Partial<ListingStats> | null): ListingStats {
    const legacyForSale = stats?.forSale as Partial<ListingStats['forSale']> & { building?: number } | undefined;

    return {
        byTypePurpose: {
            house: { ...EMPTY_LISTING_STATS.byTypePurpose.house, ...(stats?.byTypePurpose?.house || {}) },
            land: { ...EMPTY_LISTING_STATS.byTypePurpose.land, ...(stats?.byTypePurpose?.land || {}) },
            building: { ...EMPTY_LISTING_STATS.byTypePurpose.building, ...(stats?.byTypePurpose?.building || {}) },
            apartment: { ...EMPTY_LISTING_STATS.byTypePurpose.apartment, ...(stats?.byTypePurpose?.apartment || {}) },
            flat: { ...EMPTY_LISTING_STATS.byTypePurpose.flat, ...(stats?.byTypePurpose?.flat || {}) },
            business: { ...EMPTY_LISTING_STATS.byTypePurpose.business, ...(stats?.byTypePurpose?.business || {}) },
            commercialSpace: { ...EMPTY_LISTING_STATS.byTypePurpose.commercialSpace, ...(stats?.byTypePurpose?.commercialSpace || {}) },
            officeSpace: { ...EMPTY_LISTING_STATS.byTypePurpose.officeSpace, ...(stats?.byTypePurpose?.officeSpace || {}) },
        },
        forSale: {
            ...EMPTY_LISTING_STATS.forSale,
            ...(stats?.forSale || {}),
            apartment: legacyForSale?.apartment ?? legacyForSale?.building ?? 0,
        },
        forRent: {
            ...EMPTY_LISTING_STATS.forRent,
            ...(stats?.forRent || {}),
        },
        requirements: {
            ...EMPTY_LISTING_STATS.requirements,
            ...(stats?.requirements || {}),
            purchaseByType: {
                ...EMPTY_LISTING_STATS.requirements.purchaseByType,
                ...(stats?.requirements?.purchaseByType || {}),
            },
            rentalByType: {
                ...EMPTY_LISTING_STATS.requirements.rentalByType,
                ...(stats?.requirements?.rentalByType || {}),
            },
        },
    };
}

async function ensureListingStatsTable() {
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS listing_stats_cache (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            payload TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function countPropertyByTypeAndPurpose(typeName: string, purposeName: string) {
    return prisma.property.count({
        where: {
            status: 'approved',
            types: {
                some: {
                    name: { equals: typeName },
                },
            },
            purposes: {
                some: {
                    name: { equals: purposeName },
                },
            },
        },
    });
}

async function countRequirementByTypeAndPurpose(typeName: string, purposeName: string) {
    return prisma.requirement.count({
        where: {
            status: 'active',
            purposes: { contains: purposeName, mode: 'insensitive' },
            propertyTypes: { contains: typeName, mode: 'insensitive' },
        },
    });
}

export async function computeListingStats(): Promise<ListingStats> {
    const [
        houseSale,
        houseRent,
        landSale,
        landRent,
        buildingSale,
        buildingRent,
        apartmentSale,
        apartmentRent,
        flatSale,
        flatRent,
        businessSale,
        businessRent,
        commercialSpaceRent,
        officeSpaceRent,
        totalRent,
        totalRequirements,
        rentalRequirements,
        purchaseRequirements,
        purchaseHouseRequirements,
        purchaseLandRequirements,
        purchaseApartmentRequirements,
        purchaseBusinessRequirements,
        rentalFlatRequirements,
        rentalHouseRequirements,
        rentalApartmentRequirements,
        rentalCommercialSpaceRequirements,
        rentalOfficeSpaceRequirements,
        rentalBusinessRequirements,
    ] = await Promise.all([
        countPropertyByTypeAndPurpose('house', 'sale'),
        countPropertyByTypeAndPurpose('house', 'rent'),
        countPropertyByTypeAndPurpose('land', 'sale'),
        countPropertyByTypeAndPurpose('land', 'rent'),
        countPropertyByTypeAndPurpose('building', 'sale'),
        countPropertyByTypeAndPurpose('building', 'rent'),
        countPropertyByTypeAndPurpose('apartment', 'sale'),
        countPropertyByTypeAndPurpose('apartment', 'rent'),
        countPropertyByTypeAndPurpose('flat', 'sale'),
        countPropertyByTypeAndPurpose('flat', 'rent'),
        countPropertyByTypeAndPurpose('business', 'sale'),
        countPropertyByTypeAndPurpose('business', 'rent'),
        countPropertyByTypeAndPurpose('commercial space', 'rent'),
        countPropertyByTypeAndPurpose('office space', 'rent'),
        prisma.property.count({
            where: {
                status: 'approved',
                purposes: {
                    some: {
                        name: { equals: 'rent' },
                    },
                },
            },
        }),
        prisma.requirement.count({ where: { status: 'active' } }),
        prisma.requirement.count({ where: { status: 'active', purposes: { contains: 'rent' } } }),
        prisma.requirement.count({ where: { status: 'active', purposes: { contains: 'sale' } } }),
        countRequirementByTypeAndPurpose('house', 'sale'),
        countRequirementByTypeAndPurpose('land', 'sale'),
        countRequirementByTypeAndPurpose('apartment', 'sale'),
        countRequirementByTypeAndPurpose('business', 'sale'),
        countRequirementByTypeAndPurpose('flat', 'rent'),
        countRequirementByTypeAndPurpose('house', 'rent'),
        countRequirementByTypeAndPurpose('apartment', 'rent'),
        countRequirementByTypeAndPurpose('commercial space', 'rent'),
        countRequirementByTypeAndPurpose('office space', 'rent'),
        countRequirementByTypeAndPurpose('business', 'rent'),
    ]);

    return {
        byTypePurpose: {
            house: { sale: houseSale, rent: houseRent },
            land: { sale: landSale, rent: landRent },
            building: { sale: buildingSale, rent: buildingRent },
            apartment: { sale: apartmentSale, rent: apartmentRent },
            flat: { sale: flatSale, rent: flatRent },
            business: { sale: businessSale, rent: businessRent },
            commercialSpace: { sale: 0, rent: commercialSpaceRent },
            officeSpace: { sale: 0, rent: officeSpaceRent },
        },
        forSale: {
            house: houseSale,
            land: landSale,
            apartment: apartmentSale,
            business: businessSale,
        },
        forRent: {
            flat: flatRent,
            house: houseRent,
            apartment: apartmentRent,
            commercialSpace: commercialSpaceRent,
            officeSpace: officeSpaceRent,
            business: businessRent,
            totalRent,
        },
        requirements: {
            total: totalRequirements,
            rental: rentalRequirements,
            purchase: purchaseRequirements,
            purchaseByType: {
                house: purchaseHouseRequirements,
                land: purchaseLandRequirements,
                apartment: purchaseApartmentRequirements,
                business: purchaseBusinessRequirements,
            },
            rentalByType: {
                flat: rentalFlatRequirements,
                house: rentalHouseRequirements,
                apartment: rentalApartmentRequirements,
                commercialSpace: rentalCommercialSpaceRequirements,
                officeSpace: rentalOfficeSpaceRequirements,
                business: rentalBusinessRequirements,
            },
        },
    };
}

export async function refreshAndCacheListingStats() {
    const session = await getSession();
    if (!session?.id) {
        throw new Error('Unauthorized');
    }

    const user = await prisma.user.findUnique({ where: { id: Number(session.id) } });
    if (user?.type !== 'admin') {
        throw new Error('Unauthorized');
    }

    const stats = await computeListingStats();
    await ensureListingStatsTable();

    await prisma.$executeRawUnsafe(
        `
        INSERT INTO listing_stats_cache (id, payload, updated_at)
        VALUES (1, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            payload = excluded.payload,
            updated_at = CURRENT_TIMESTAMP
    `,
        JSON.stringify(stats)
    );

    revalidatePath('/');
    revalidatePath('/manage/stat');

    return stats;
}

export async function getCachedListingStats(): Promise<{ stats: ListingStats; updatedAt: string | null }> {
    try {
        await ensureListingStatsTable();
        const rows = await prisma.$queryRawUnsafe<CachedStatsRow[]>(
            `SELECT payload, updated_at FROM listing_stats_cache WHERE id = 1 LIMIT 1`
        );

        if (!rows || rows.length === 0) {
            return { stats: EMPTY_LISTING_STATS, updatedAt: null };
        }

        const parsed = JSON.parse(rows[0].payload) as ListingStats;
        return {
            stats: normalizeListingStats(parsed),
            updatedAt: rows[0].updated_at || null,
        };
    } catch (error) {
        console.error('Failed to load cached listing stats:', error);
        return { stats: EMPTY_LISTING_STATS, updatedAt: null };
    }
}
