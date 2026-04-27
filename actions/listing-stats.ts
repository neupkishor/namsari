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
    };
    forSale: {
        house: number;
        land: number;
        building: number;
    };
    forRent: {
        flat: number;
        house: number;
        apartment: number;
        totalRent: number;
    };
    requirements: {
        total: number;
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
    },
    forSale: {
        house: 0,
        land: 0,
        building: 0,
    },
    forRent: {
        flat: 0,
        house: 0,
        apartment: 0,
        totalRent: 0,
    },
    requirements: {
        total: 0,
    },
};

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
        totalRent,
        totalRequirements,
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
    ]);

    return {
        byTypePurpose: {
            house: { sale: houseSale, rent: houseRent },
            land: { sale: landSale, rent: landRent },
            building: { sale: buildingSale, rent: buildingRent },
            apartment: { sale: apartmentSale, rent: apartmentRent },
            flat: { sale: flatSale, rent: flatRent },
        },
        forSale: {
            house: houseSale,
            land: landSale,
            building: buildingSale,
        },
        forRent: {
            flat: flatRent,
            house: houseRent,
            apartment: apartmentRent,
            totalRent,
        },
        requirements: {
            total: totalRequirements,
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
            stats: parsed || EMPTY_LISTING_STATS,
            updatedAt: rows[0].updated_at || null,
        };
    } catch (error) {
        console.error('Failed to load cached listing stats:', error);
        return { stats: EMPTY_LISTING_STATS, updatedAt: null };
    }
}

