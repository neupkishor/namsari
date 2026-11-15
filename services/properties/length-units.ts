export type LengthUnit = 'm' | 'km' | 'cm' | 'mm' | 'ft' | 'in' | 'yd';

const METERS_PER_UNIT: Record<LengthUnit, number> = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    ft: 0.3048,
    in: 0.0254,
    yd: 0.9144,
};

// Normalizes common length unit names and symbols to a supported unit.
export function normalizeLengthUnit(unit?: string | null): LengthUnit {
    const normalized = String(unit || '').trim().toLowerCase().replace(/[.\s]/g, '');

    if (['km', 'kilometer', 'kilometers', 'kilometre', 'kilometres'].includes(normalized)) return 'km';
    if (['cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres'].includes(normalized)) return 'cm';
    if (['mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres'].includes(normalized)) return 'mm';
    if (['in', 'inch', 'inches'].includes(normalized)) return 'in';
    if (['yd', 'yard', 'yards'].includes(normalized)) return 'yd';
    if (['m', 'meter', 'meters', 'metre', 'metres'].includes(normalized)) return 'm';
    if (['ft', 'feet', 'foot', "'"].includes(normalized)) return 'ft';

    return 'ft';
}

// Converts a measurement to meters for storage.
export function convertLengthToMeters(value: number, fromUnit?: string | null): number {
    if (!Number.isFinite(value)) return NaN;
    const meters = value * METERS_PER_UNIT[normalizeLengthUnit(fromUnit)];
    return Number(meters.toFixed(10));
}

// Converts a stored meter value to a requested display unit.
export function convertLengthValue(value: number, toUnit?: string | null): number {
    if (!Number.isFinite(value)) return NaN;
    return value / METERS_PER_UNIT[normalizeLengthUnit(toUnit)];
}
