
export type Pricing = {
    price: number;
    rate: 'total' | 'perUnit' | 'perMonth' | 'perUnitPerMonth';
    unit?: string; // 'aana', 'sqft', etc.
    totalUnit?: number;
    totalPrice?: number;
    negotiable?: boolean;
};

export function getDefaultPricing(propertyTypes: string[], purposes: string[]): Pricing {
    const isSale = purposes.includes('sale');
    const isRent = purposes.includes('rent');
    const isHouse = propertyTypes.includes('house') || propertyTypes.includes('bungalow') || propertyTypes.includes('apartment') || propertyTypes.includes('villa') || propertyTypes.includes('penthouse');
    const isLand = propertyTypes.includes('land');
    const isCommercial = propertyTypes.includes('commercial space');

    if (isSale) {
        if (isHouse) return { price: 0, rate: 'total', negotiable: true };
        if (isLand) return { price: 0, rate: 'perUnit', unit: 'aana', negotiable: true };
        if (isCommercial) return { price: 0, rate: 'total', negotiable: true }; // Assuming commercial space sale is flat price
    }

    if (isRent) {
        if (isHouse) return { price: 0, rate: 'perMonth', negotiable: true };
        if (isLand) return { price: 0, rate: 'perUnitPerMonth', unit: 'aana', negotiable: true };
        if (isCommercial) return { price: 0, rate: 'perMonthPerUnit', unit: 'sqft', negotiable: true }; // Commercial rent per sqft per month
    }

    // Default fallback
    return { price: 0, rate: 'total', negotiable: true };
}

export function formatPriceForDisplay(pricing: Pricing): string {
    if (!pricing || pricing.price === 0) return 'Price on Request';

    const formattedPrice = new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
        maximumFractionDigits: 0
    }).format(pricing.price).replace('NPR', 'NRs.');

    switch (pricing.rate) {
        case 'total':
            return formattedPrice;
        case 'perUnit':
            return `${formattedPrice} per ${pricing.unit || 'unit'}`;
        case 'perMonth':
            return `${formattedPrice} per month`;
        case 'perUnitPerMonth':
            return `${formattedPrice} per ${pricing.unit || 'unit'} per month`;
        default:
            return formattedPrice;
    }
}

export function getPrimaryPrice(priceData: any[] | null): Pricing | null {
    if (!priceData || priceData.length === 0) return null;
    return priceData[0]; // Assuming the first entry is the primary price
}
