export type PropertyPriceRate = 'total' | 'perUnit' | 'perMonth' | 'perUnitPerMonth';

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

    if (rate === 'perMonth') {
        return {
            price: basePrice,
            rate,
            unit,
            totalUnit,
        };
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
        rentPrice: price.rate === 'perMonth' || price.rate === 'perUnitPerMonth' ? price.price : undefined,
    };
}