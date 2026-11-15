export type AreaUnit = 'sqm' | 'sqft' | 'aana' | 'kattha' | 'dhur' | 'ropani';

const SQUARE_METERS_PER_UNIT: Record<AreaUnit, number> = {
    sqm: 1,
    sqft: 0.09290304,
    aana: 31.79606544,
    kattha: 338.6315808,
    dhur: 16.93157904,
    ropani: 508.73704704,
};

const AREA_UNIT_LABELS: Record<AreaUnit, string> = {
    sqm: 'm2',
    sqft: 'sq.ft.',
    aana: 'aana',
    kattha: 'kattha',
    dhur: 'dhoor',
    ropani: 'ropani',
};

export function normalizeAreaUnit(unit?: string | null): AreaUnit {
    const normalized = String(unit || '').trim().toLowerCase();

    if (
        !normalized ||
        normalized === 'sqm' ||
        normalized === 'sq.m' ||
        normalized === 'sq m' ||
        normalized === 'm²' ||
        normalized === 'square meter' ||
        normalized === 'square meters' ||
        normalized === 'm2' ||
        normalized.includes('meter')
    ) {
        return 'sqm';
    }

    if (
        normalized === 'sqft' ||
        normalized === 'sq.ft' ||
        normalized === 'sq ft' ||
        normalized === 'ft2' ||
        normalized === 'square feet' ||
        normalized === 'sq.ft.' ||
        normalized.includes('sqft')
    ) {
        return 'sqft';
    }

    if (normalized.includes('aana')) return 'aana';
    if (normalized.includes('kattha') || normalized.includes('katta') || normalized.includes('katha')) return 'kattha';
    if (normalized.includes('dhur') || normalized.includes('dhoor')) return 'dhur';
    if (normalized.includes('ropani')) return 'ropani';

    return 'sqm';
}

export function areaUnitLabel(unit: AreaUnit): string {
    return AREA_UNIT_LABELS[unit];
}

export function convertAreaValue(value: number, fromUnit?: string | null, toUnit: AreaUnit = 'sqm'): number {
    if (!Number.isFinite(value)) return NaN;

    const sourceUnit = normalizeAreaUnit(fromUnit);
    return (value * SQUARE_METERS_PER_UNIT[sourceUnit]) / SQUARE_METERS_PER_UNIT[toUnit];
}

// Converts an entered area to the database's square-meter storage unit.
export function convertAreaToSquareMeters(value: number, fromUnit?: string | null): number {
    return roundMeasurement(convertAreaValue(value, fromUnit, 'sqm'));
}

// Keeps converted measurements within the database's ten decimal places.
function roundMeasurement(value: number): number {
    return Number(value.toFixed(10));
}

