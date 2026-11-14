import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const priceBasisByLegacyBase: Record<string, string> = {
    flatprice: 'total',
    flatpricepermonth: 'perMonth',
    flatpriceperquarter: 'perMonth',
    flatpricepersemiannually: 'perMonth',
    flatpriceperannually: 'perYear',
    priceperunit: 'perUnit',
    priceperunitpermonth: 'perUnitPerMonth',
    priceperunitperquarter: 'perUnitPerMonth',
    priceperunitpersemiannually: 'perUnitPerMonth',
    priceperunitperannually: 'perUnitPerYear',
    priceoncall: 'total',
};

// Converts legacy display strings into a nullable decimal-compatible number.
function parseListedPrice(display: string) {
    const normalized = display.replace(/,/g, '').replace(/[^0-9.]/g, '');
    if (!normalized) return null;
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : null;
}

// Maps old price labels to the enum values available in the new Property schema.
function parsePriceBasis(base: string) {
    return priceBasisByLegacyBase[base.replace(/[^a-z]/gi, '').toLowerCase()] || 'total';
}

// Selects one price per property, preferring its default row and otherwise its oldest row.
async function migratePropertyPrices() {
    const legacyPrices = await prisma.$queryRaw<Array<{
        propertyId: number;
        base: string;
        display: string;
        negotiable: boolean;
        id: number;
    }>>`SELECT "propertyId", "base", "display", "negotiable", "id" FROM "PropertyPrice" p WHERE p.id = (
        SELECT chosen.id FROM "PropertyPrice" chosen
        WHERE chosen."propertyId" = p."propertyId"
        ORDER BY chosen."isDefault" DESC, chosen."id" ASC
        LIMIT 1
    ) ORDER BY p."propertyId"`;

    await prisma.$transaction(async (transaction) => {
        for (const price of legacyPrices) {
            await transaction.$executeRaw`
                UPDATE "Property"
                SET "price_basis" = ${parsePriceBasis(price.base)}::"PropertyPriceBasis",
                    "price_listed" = ${parseListedPrice(price.display)}::DECIMAL(18,2),
                    "price_negotiable" = ${price.negotiable}
                WHERE "id" = ${price.propertyId}
            `;
        }
    });

    console.log(`Migrated ${legacyPrices.length} property price records.`);
}

// Runs the one-time data migration and always closes the Prisma connection.
async function main() {
    try {
        await migratePropertyPrices();
    } finally {
        await prisma.$disconnect();
    }
}

void main();
