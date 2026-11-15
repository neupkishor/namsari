export type AreaUnit = 'sqm' | 'sqft' | 'aana' | 'kattha' | 'dhur' | 'ropani';

const SQFT_PER_UNIT: Record<AreaUnit, number> = {
    sqm: 10.7639,
    sqft: 1,
    aana: 342.25,
    kattha: 3645,
    dhur: 182.25,
    ropani: 5476,
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
        normalized === 'square meter' ||
        normalized === 'square meters' ||
        normalized === 'm2' ||
        normalized === 'm²' ||
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
    const sourceSqft = SQFT_PER_UNIT[sourceUnit];
    const targetSqft = SQFT_PER_UNIT[toUnit];

    return (value * sourceSqft) / targetSqft;
}

