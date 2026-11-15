// Defines the filters accepted by property search and browse services.
export type PropertyFilterPayload = {
    query?: string;
    locations?: string[];
    types?: string[];
    category?: string;
    listedBy?: 'owner' | 'agent' | 'agency';
    minPrice?: number;
    maxPrice?: number;
    minSize?: number;
    maxSize?: number;
    sizeUnit?: 'sqm' | 'sqft' | 'aana' | 'ropani' | 'kattha' | 'dhur';
    sortBy?: 'price' | 'date';
    limit?: number;
    onlyMappable?: boolean;
    pricedOnly?: boolean;
};
