export type PropertyPriceRate = 'total' | 'perUnit' | 'perMonth' | 'perYear' | 'perUnitPerMonth' | 'perUnitPerYear';

export type PropertyPriceInput = {
    price: number;
    rate: PropertyPriceRate;
    unit?: string;
    totalUnit?: number;
    totalPrice?: number;
};

export type LegacyPricingInput = {
    negotiable?: boolean;
    pricingType?: string;
    unit?: string;
    price: number;
    priceInWords?: string;
    priceNegotiable?: number;
    priceNegotiableInWords?: string;
    rentPrice?: number;
};

const DEFAULT_RATE_BY_PURPOSE: Record<string, PropertyPriceRate> = {
    sale: 'total',
    rent: 'perMonth',
};

export function getDefaultPropertyPriceRate(types: string[] = [], purposes: string[] = []): PropertyPriceRate {
    const normalizedTypes = types.map((type) => type.toLowerCase());
    const normalizedPurposes = purposes.map((purpose) => purpose.toLowerCase());

    if (normalizedTypes.includes('commercial space')) {
        return 'perUnitPerMonth';
    }

    if (normalizedTypes.includes('land')) {
        return normalizedPurposes.includes('rent') ? 'perUnitPerMonth' : 'perUnit';
    }

    if (normalizedTypes.some((type) => ['house', 'bungalow', 'villa', 'multiplex', 'apartment', 'penthouse'].includes(type))) {
        return normalizedPurposes.includes('rent') ? 'perMonth' : 'total';
    }

    return DEFAULT_RATE_BY_PURPOSE[normalizedPurposes[0] || 'sale'] || 'total';
}

export function normalizePropertyPriceInput(input: PropertyPriceInput): PropertyPriceInput {
    const rate = input.rate;
    const basePrice = Number(input.price) || 0;
    const totalUnit = input.totalUnit != null ? Number(input.totalUnit) : undefined;
    const unit = input.unit || undefined;

    if (rate === 'total') {
        return {
            price: basePrice,
            rate,
            totalUnit: basePrice,
            totalPrice: basePrice,
        };
    }

    if (rate === 'perUnit') {
        const units = totalUnit ?? 1;
        return {
            price: basePrice,
            rate,
            unit,
            totalUnit: units,
            totalPrice: basePrice * units,
        };
    }

    if (rate === 'perMonth' || rate === 'perYear') {
        return { price: basePrice, rate, unit, totalUnit };
    }

    return {
        price: basePrice,
        rate,
        unit,
        totalUnit: totalUnit ?? 1,
    };
}

export function normalizeDetailedPropertyPrices(prices?: PropertyPriceInput[]): PropertyPriceInput[] {
    return (prices || []).map((price) => normalizePropertyPriceInput(price));
}

export function legacyPricingFromPrice(price?: PropertyPriceInput | null) {
    if (!price) return null;

    return {
        negotiable: false,
        pricingType: price.rate === 'total' ? 'flat' : price.rate,
        unit: price.unit,
        price: price.price,
        priceInWords: undefined,
        priceNegotiable: undefined,
        priceNegotiableInWords: undefined,
        rentPrice: ['perMonth', 'perUnitPerMonth', 'perYear', 'perUnitPerYear'].includes(price.rate) ? price.price : undefined,
    };
}

// Builds the legacy card pricing shape from the new Property columns.
export function legacyPricingFromProperty(property: { price_listed?: unknown; price_basis?: PropertyPriceRate; price_negotiable?: boolean }) {
    if (property.price_listed == null || property.price_listed === '') return null;

    const amount = Number(property.price_listed);
    if (!Number.isFinite(amount)) return null;

    const pricing = legacyPricingFromPrice({
        price: amount,
        rate: property.price_basis || 'total',
    } as PropertyPriceInput) && {
        ...legacyPricingFromPrice({ price: amount, rate: property.price_basis || 'total' }),
        negotiable: Boolean(property.price_negotiable),
    };
    return pricing;
}

// Converts legacy price labels into the property table's supported pricing basis.
export function propertyPriceBasisFromLegacyBase(base?: string | null): PropertyPriceRate {
    const normalized = String(base || '').toLowerCase();
    if (normalized === 'priceoncall') return 'total';
    if (normalized.includes('perunit') && (normalized.includes('annually') || normalized.includes('year'))) return 'perUnitPerYear';
    if (normalized.includes('perunit') && (normalized.includes('month') || normalized.includes('quarter') || normalized.includes('semiannually'))) return 'perUnitPerMonth';
    if (normalized.includes('perunit')) return 'perUnit';
    if (normalized.includes('annually') || normalized.includes('year')) return 'perYear';
    if (normalized.includes('month') || normalized.includes('quarter') || normalized.includes('semiannually')) return 'perMonth';
    return 'total';
}

// Extracts a numeric amount from legacy display strings.
export function numericPriceFromDisplay(display?: string | null): number | null {
    const normalized = String(display || '').replace(/,/g, '').replace(/[^0-9.]/g, '');
    if (!normalized) return null;
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : null;
}
