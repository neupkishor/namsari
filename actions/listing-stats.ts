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
    byNatureTypePurpose: {
        residential: {
            house: { sale: number; rent: number };
            land: { sale: number; rent: number };
            building: { sale: number; rent: number };
            apartment: { sale: number; rent: number };
            flat: { sale: number; rent: number };
            business: { sale: number; rent: number };
            commercialSpace: { sale: number; rent: number };
            officeSpace: { sale: number; rent: number };
        };
        commercial: {
            house: { sale: number; rent: number };
            land: { sale: number; rent: number };
            building: { sale: number; rent: number };
            apartment: { sale: number; rent: number };
            flat: { sale: number; rent: number };
            business: { sale: number; rent: number };
            commercialSpace: { sale: number; rent: number };
            officeSpace: { sale: number; rent: number };
        };
        'semi-commercial': {
            house: { sale: number; rent: number };
            land: { sale: number; rent: number };
            building: { sale: number; rent: number };
            apartment: { sale: number; rent: number };
            flat: { sale: number; rent: number };
            business: { sale: number; rent: number };
            commercialSpace: { sale: number; rent: number };
            officeSpace: { sale: number; rent: number };
        };
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
        byNatureType: {
            residential: {
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
            commercial: {
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
            'semi-commercial': {
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
        };
    };
}

interface CachedStatsRow {
    payload: string;
    updated_at: string;
}

const LISTING_STATS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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
    byNatureTypePurpose: {
        residential: {
            house: { sale: 0, rent: 0 },
            land: { sale: 0, rent: 0 },
            building: { sale: 0, rent: 0 },
            apartment: { sale: 0, rent: 0 },
            flat: { sale: 0, rent: 0 },
            business: { sale: 0, rent: 0 },
            commercialSpace: { sale: 0, rent: 0 },
            officeSpace: { sale: 0, rent: 0 },
        },
        commercial: {
            house: { sale: 0, rent: 0 },
            land: { sale: 0, rent: 0 },
            building: { sale: 0, rent: 0 },
            apartment: { sale: 0, rent: 0 },
            flat: { sale: 0, rent: 0 },
            business: { sale: 0, rent: 0 },
            commercialSpace: { sale: 0, rent: 0 },
            officeSpace: { sale: 0, rent: 0 },
        },
        'semi-commercial': {
            house: { sale: 0, rent: 0 },
            land: { sale: 0, rent: 0 },
            building: { sale: 0, rent: 0 },
            apartment: { sale: 0, rent: 0 },
            flat: { sale: 0, rent: 0 },
            business: { sale: 0, rent: 0 },
            commercialSpace: { sale: 0, rent: 0 },
            officeSpace: { sale: 0, rent: 0 },
        },
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
        byNatureType: {
            residential: {
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
            commercial: {
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
            'semi-commercial': {
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
        byNatureTypePurpose: {
            residential: {
                house: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.residential.house, ...(stats?.byNatureTypePurpose?.residential?.house || {}) },
                land: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.residential.land, ...(stats?.byNatureTypePurpose?.residential?.land || {}) },
                building: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.residential.building, ...(stats?.byNatureTypePurpose?.residential?.building || {}) },
                apartment: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.residential.apartment, ...(stats?.byNatureTypePurpose?.residential?.apartment || {}) },
                flat: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.residential.flat, ...(stats?.byNatureTypePurpose?.residential?.flat || {}) },
                business: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.residential.business, ...(stats?.byNatureTypePurpose?.residential?.business || {}) },
                commercialSpace: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.residential.commercialSpace, ...(stats?.byNatureTypePurpose?.residential?.commercialSpace || {}) },
                officeSpace: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.residential.officeSpace, ...(stats?.byNatureTypePurpose?.residential?.officeSpace || {}) },
            },
            commercial: {
                house: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.commercial.house, ...(stats?.byNatureTypePurpose?.commercial?.house || {}) },
                land: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.commercial.land, ...(stats?.byNatureTypePurpose?.commercial?.land || {}) },
                building: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.commercial.building, ...(stats?.byNatureTypePurpose?.commercial?.building || {}) },
                apartment: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.commercial.apartment, ...(stats?.byNatureTypePurpose?.commercial?.apartment || {}) },
                flat: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.commercial.flat, ...(stats?.byNatureTypePurpose?.commercial?.flat || {}) },
                business: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.commercial.business, ...(stats?.byNatureTypePurpose?.commercial?.business || {}) },
                commercialSpace: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.commercial.commercialSpace, ...(stats?.byNatureTypePurpose?.commercial?.commercialSpace || {}) },
                officeSpace: { ...EMPTY_LISTING_STATS.byNatureTypePurpose.commercial.officeSpace, ...(stats?.byNatureTypePurpose?.commercial?.officeSpace || {}) },
            },
            'semi-commercial': {
                house: { ...EMPTY_LISTING_STATS.byNatureTypePurpose['semi-commercial'].house, ...(stats?.byNatureTypePurpose?.['semi-commercial']?.house || {}) },
                land: { ...EMPTY_LISTING_STATS.byNatureTypePurpose['semi-commercial'].land, ...(stats?.byNatureTypePurpose?.['semi-commercial']?.land || {}) },
                building: { ...EMPTY_LISTING_STATS.byNatureTypePurpose['semi-commercial'].building, ...(stats?.byNatureTypePurpose?.['semi-commercial']?.building || {}) },
                apartment: { ...EMPTY_LISTING_STATS.byNatureTypePurpose['semi-commercial'].apartment, ...(stats?.byNatureTypePurpose?.['semi-commercial']?.apartment || {}) },
                flat: { ...EMPTY_LISTING_STATS.byNatureTypePurpose['semi-commercial'].flat, ...(stats?.byNatureTypePurpose?.['semi-commercial']?.flat || {}) },
                business: { ...EMPTY_LISTING_STATS.byNatureTypePurpose['semi-commercial'].business, ...(stats?.byNatureTypePurpose?.['semi-commercial']?.business || {}) },
                commercialSpace: { ...EMPTY_LISTING_STATS.byNatureTypePurpose['semi-commercial'].commercialSpace, ...(stats?.byNatureTypePurpose?.['semi-commercial']?.commercialSpace || {}) },
                officeSpace: { ...EMPTY_LISTING_STATS.byNatureTypePurpose['semi-commercial'].officeSpace, ...(stats?.byNatureTypePurpose?.['semi-commercial']?.officeSpace || {}) },
            },
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
            byNatureType: {
                residential: {
                    purchaseByType: {
                        ...EMPTY_LISTING_STATS.requirements.byNatureType.residential.purchaseByType,
                        ...(stats?.requirements?.byNatureType?.residential?.purchaseByType || {}),
                    },
                    rentalByType: {
                        ...EMPTY_LISTING_STATS.requirements.byNatureType.residential.rentalByType,
                        ...(stats?.requirements?.byNatureType?.residential?.rentalByType || {}),
                    },
                },
                commercial: {
                    purchaseByType: {
                        ...EMPTY_LISTING_STATS.requirements.byNatureType.commercial.purchaseByType,
                        ...(stats?.requirements?.byNatureType?.commercial?.purchaseByType || {}),
                    },
                    rentalByType: {
                        ...EMPTY_LISTING_STATS.requirements.byNatureType.commercial.rentalByType,
                        ...(stats?.requirements?.byNatureType?.commercial?.rentalByType || {}),
                    },
                },
                'semi-commercial': {
                    purchaseByType: {
                        ...EMPTY_LISTING_STATS.requirements.byNatureType['semi-commercial'].purchaseByType,
                        ...(stats?.requirements?.byNatureType?.['semi-commercial']?.purchaseByType || {}),
                    },
                    rentalByType: {
                        ...EMPTY_LISTING_STATS.requirements.byNatureType['semi-commercial'].rentalByType,
                        ...(stats?.requirements?.byNatureType?.['semi-commercial']?.rentalByType || {}),
                    },
                },
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

async function saveListingStatsCache(stats: ListingStats) {
    await ensureListingStatsTable();

    await prisma.$executeRawUnsafe(
        `
            INSERT INTO listing_stats_cache (id, payload, updated_at)
            VALUES (1, $1, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                payload = excluded.payload,
                updated_at = CURRENT_TIMESTAMP
        `,
        JSON.stringify(stats)
    );
}

async function readListingStatsCache() {
    await ensureListingStatsTable();

    const rows = await prisma.$queryRawUnsafe(
        `SELECT payload, updated_at FROM listing_stats_cache WHERE id = 1 LIMIT 1`
    ) as CachedStatsRow[];

    return rows && rows.length > 0 ? rows[0] : null;
}

function isCacheStale(updatedAt: string | null | undefined) {
    if (!updatedAt) return true;
    const timestamp = parseCacheTimestamp(updatedAt);
    if (!Number.isFinite(timestamp)) return true;
    return Date.now() - timestamp > LISTING_STATS_CACHE_TTL_MS;
}

function parseCacheTimestamp(value: string) {
    const normalized = value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
    return new Date(normalized).getTime();
}

function formatCacheTimestamp(value: string | null | undefined) {
    if (!value) return null;
    const timestamp = parseCacheTimestamp(value);
    if (!Number.isFinite(timestamp)) return null;
    return new Date(timestamp).toISOString();
}

async function countPropertyByTypeAndPurpose(typeName: string, purposeName: string) {
    return prisma.property.count({
        where: {
            status: 'approved',
            types: { has: typeName.replace(' ', '_') as any },
            purposes: { has: purposeName as any },
        },
    });
}

async function countPropertyByTypeAndPurposeAndNature(typeName: string, purposeName: string, natureName: string) {
    return prisma.property.count({
        where: {
            status: 'approved',
            types: { has: typeName.replace(' ', '_') as any },
            purposes: { has: purposeName as any },
            natures: {
                some: {
                    name: { equals: natureName },
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

async function countRequirementByTypePurposeAndNature(typeName: string, purposeName: string, natureName: string) {
    return prisma.requirement.count({
        where: {
            status: 'active',
            purposes: { contains: purposeName, mode: 'insensitive' },
            propertyTypes: { contains: typeName, mode: 'insensitive' },
            natures: { contains: natureName, mode: 'insensitive' },
        },
    });
}

export async function computeListingStats(): Promise<ListingStats> {
    const byNatureTypePurpose = await (async (): Promise<ListingStats['byNatureTypePurpose']> => {
        const natureMap = {
            residential: 'residential',
            commercial: 'commercial',
            'semi-commercial': 'semi commercial',
        } as const;

        const typeMap = {
            house: 'house',
            land: 'land',
            building: 'building',
            apartment: 'apartment',
            flat: 'flat',
            business: 'business',
            commercialSpace: 'commercial space',
            officeSpace: 'office space',
        } as const;

        const natureEntries = await Promise.all(
            Object.entries(natureMap).map(async ([natureKey, natureName]) => {
                const typeEntries = await Promise.all(
                    Object.entries(typeMap).map(async ([typeKey, typeName]) => {
                        const [sale, rent] = await Promise.all([
                            countPropertyByTypeAndPurposeAndNature(typeName, 'sale', natureName),
                            countPropertyByTypeAndPurposeAndNature(typeName, 'rent', natureName),
                        ]);

                        return [typeKey, { sale, rent }] as const;
                    })
                );

                return [natureKey, Object.fromEntries(typeEntries)] as const;
            })
        );

        return Object.fromEntries(natureEntries) as ListingStats['byNatureTypePurpose'];
    })();

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

    const requirementByNatureType = await (async (): Promise<ListingStats['requirements']['byNatureType']> => {
        const natureMap = {
            residential: 'residential',
            commercial: 'commercial',
            'semi-commercial': 'semi commercial',
        } as const;

        const resultEntries = await Promise.all(
            Object.entries(natureMap).map(async ([natureKey, natureName]) => {
                const [
                    purchaseHouse,
                    purchaseLand,
                    purchaseApartment,
                    purchaseBusiness,
                    rentalFlat,
                    rentalHouse,
                    rentalApartment,
                    rentalCommercialSpace,
                    rentalOfficeSpace,
                    rentalBusiness,
                ] = await Promise.all([
                    countRequirementByTypePurposeAndNature('house', 'sale', natureName),
                    countRequirementByTypePurposeAndNature('land', 'sale', natureName),
                    countRequirementByTypePurposeAndNature('apartment', 'sale', natureName),
                    countRequirementByTypePurposeAndNature('business', 'sale', natureName),
                    countRequirementByTypePurposeAndNature('flat', 'rent', natureName),
                    countRequirementByTypePurposeAndNature('house', 'rent', natureName),
                    countRequirementByTypePurposeAndNature('apartment', 'rent', natureName),
                    countRequirementByTypePurposeAndNature('commercial space', 'rent', natureName),
                    countRequirementByTypePurposeAndNature('office space', 'rent', natureName),
                    countRequirementByTypePurposeAndNature('business', 'rent', natureName),
                ]);

                return [natureKey, {
                    purchaseByType: {
                        house: purchaseHouse,
                        land: purchaseLand,
                        apartment: purchaseApartment,
                        business: purchaseBusiness,
                    },
                    rentalByType: {
                        flat: rentalFlat,
                        house: rentalHouse,
                        apartment: rentalApartment,
                        commercialSpace: rentalCommercialSpace,
                        officeSpace: rentalOfficeSpace,
                        business: rentalBusiness,
                    },
                }] as const;
            })
        );

        return Object.fromEntries(resultEntries) as ListingStats['requirements']['byNatureType'];
    })();

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
        byNatureTypePurpose,
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
            byNatureType: requirementByNatureType,
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
    await saveListingStatsCache(stats);

    revalidatePath('/');
    revalidatePath('/manage/stat');

    return stats;
}

export async function getCachedListingStats(): Promise<{ stats: ListingStats; updatedAt: string | null }> {
    try {
        const row = await readListingStatsCache();

        if (!row) {
            const stats = await computeListingStats();
            await saveListingStatsCache(stats);
            return {
                stats,
                updatedAt: new Date().toISOString(),
            };
        }

        const parsed = JSON.parse(row.payload) as Partial<ListingStats>;
        const shouldRefresh = isCacheStale(row.updated_at) || !parsed.byNatureTypePurpose;

        if (shouldRefresh) {
            const stats = await computeListingStats();
            await saveListingStatsCache(stats);
            return {
                stats,
                updatedAt: new Date().toISOString(),
            };
        }

        return {
            stats: normalizeListingStats(parsed),
            updatedAt: formatCacheTimestamp(row.updated_at),
        };
    } catch (error) {
        console.error('Failed to load cached listing stats:', error);
        return { stats: EMPTY_LISTING_STATS, updatedAt: null };
    }
}
