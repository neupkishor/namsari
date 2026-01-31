import prisma from '@/lib/prisma';
import {
    Property,
    PropertyLocation,
    PropertyPricing,
    PropertyOpenHouse,
    PropertyImage,
    PropertyVideo,
    PropertyAmenity
} from '@prisma/client';

export interface CreatePropertyInput {
    // General Details
    propertyId?: string;
    types: string[]; // house, land, etc.
    purposes: string[]; // sale, rent
    natures: string[]; // commercial, residential, etc.
    title: string;
    slug?: string;

    // Listing Data
    isPrivate?: boolean;
    status?: string;
    soldStatus?: string;
    isFeatured?: boolean;
    isExclusive?: boolean;
    isVerified?: boolean;
    remarks?: string;

    // Road and Entrance
    roadType?: string;
    roadSize?: string;
    facingDirection?: string;

    // Location Information
    location: {
        latitude?: number;
        longitude?: number;
        country?: string;
        district: string;
        cityVillage: string;
        area: string;
        ward?: string;
        landmark?: string;
        distanceFrom?: string;
    };

    // Amenities
    amenities?: Array<{
        type: string;
        name?: string;
        distance?: string;
    }>;

    // Pricing Details
    pricing: {
        negotiable?: boolean;
        pricingType: string; // flat, perUnit
        unit?: string; // meterSquare, aana
        price: number;
        priceInWords?: string;
        priceNegotiable?: number;
        priceNegotiableInWords?: string;
        rentPrice?: number;
    };

    // Open House
    openHouse?: {
        markOpenHouse?: boolean;
        date?: Date;
        startTime?: string;
        endTime?: string;
        latitude?: number;
        longitude?: number;
    };

    // Specific Features
    features?: {
        bedrooms?: number;
        bathrooms?: number;
        kitchens?: number;
        livingRooms?: number;
        floorNumber?: number;
        totalFloors?: number;
        furnishing?: string;
        builtUpArea?: number;
        builtUpAreaUnit?: string;
        parkingAvailable?: boolean;
        elevator?: boolean;
        security?: boolean;
        waterSupply?: boolean;
        electricity?: boolean;
    };

    // Owner Details
    listedById: number;
    ownerId: number;
    authorizedPersonId?: number;

    // Property Media
    images: Array<{
        url: string;
        imageOf: string;
        filename: string;
    }>;
    videos?: Array<{
        url: string;
        type: string;
    }>;
}

/**
 * Converts a number to its word representation (Nepalese context: Lakh, Crore).
 */
export function numberToWords(num: number): string {
    if (isNaN(num) || num === 0) return '';

    const units = [
        { value: 10000000, label: 'Crore' },
        { value: 100000, label: 'Lakh' },
        { value: 1000, label: 'Thousand' },
        { value: 100, label: 'Hundred' }
    ];

    let result = '';
    let remaining = num;

    for (const unit of units) {
        if (remaining >= unit.value) {
            const count = Math.floor(remaining / unit.value);
            result += `${count} ${unit.label} `;
            remaining %= unit.value;
        }
    }

    if (remaining > 0 || result === '') {
        const smallNumbers: { [key: number]: string } = {
            1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
            6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
            11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
            16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
            30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
        };

        if (remaining <= 20) {
            result += smallNumbers[remaining] || remaining.toString();
        } else {
            const tens = Math.floor(remaining / 10) * 10;
            const ones = remaining % 10;
            result += smallNumbers[tens] || '';
            if (ones > 0) result += ' ' + (smallNumbers[ones] || ones);
        }
    }

    return result.trim().toLowerCase();
}

/**
 * Generates a standardized filename for property images as requested.
 * Format: title-of-property + image-of + unique-identifier
 */
export function generatePropertyImageFilename(propertyTitle: string, imageOf: string, uniqueId: string): string {
    const cleanTitle = propertyTitle.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const cleanImageOf = imageOf.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return `${cleanTitle}-${cleanImageOf}-${uniqueId}`;
}

/**
 * Property listing method to save property information through join operations.
 * Handles creation across multiple tables: Property, Location, Pricing, OpenHouse, Image, Video, Amenity, Features.
 */
export async function createPropertyListing(input: CreatePropertyInput) {
    const {
        location,
        pricing,
        openHouse,
        features,
        amenities,
        images,
        videos,
        types,
        purposes,
        natures,
        ...propertyData
    } = input;

    // 1. Generate slug if not provided
    const slug = propertyData.slug || propertyData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // 2. Automatically generate price in words if not provided
    const finalPricing = {
        ...pricing,
        priceInWords: pricing.priceInWords || numberToWords(pricing.price),
        priceNegotiableInWords: pricing.priceNegotiable ? (pricing.priceNegotiableInWords || numberToWords(pricing.priceNegotiable)) : undefined
    };

    // 3. Wrap in a transaction to ensure atomic operations across multiple tables
    return await prisma.$transaction(async (tx) => {
        // Create the main property record first
        const property = await tx.property.create({
            data: {
                ...propertyData,
                slug,
                // Handle multi-select relations
                types: {
                    connectOrCreate: types.map(name => ({
                        where: { name },
                        create: { name }
                    }))
                },
                purposes: {
                    connectOrCreate: purposes.map(name => ({
                        where: { name },
                        create: { name }
                    }))
                },
                natures: {
                    connectOrCreate: natures.map(name => ({
                        where: { name },
                        create: { name }
                    }))
                },
                // Nested create for location
                location: {
                    create: location
                },
                // Nested create for pricing
                pricing: {
                    create: finalPricing
                },
                // Nested create for open house if provided
                openHouse: openHouse ? {
                    create: openHouse
                } : undefined,
                // Nested create for features if provided
                features: features ? {
                    create: features
                } : undefined,
                // Nested create for amenities
                amenities: amenities && amenities.length > 0 ? {
                    createMany: {
                        data: amenities
                    }
                } : undefined,
                // Nested create for images
                images: images && images.length > 0 ? {
                    createMany: {
                        data: images
                    }
                } : undefined,
                // Nested create for videos
                videos: videos && videos.length > 0 ? {
                    createMany: {
                        data: videos
                    }
                } : undefined,
            },
            include: {
                location: true,
                pricing: true,
                openHouse: true,
                features: true,
                images: true,
                videos: true,
                amenities: true,
                types: true,
                purposes: true,
                natures: true,
                owner: {
                    include: { kyc: true }
                },
                authorizedPerson: {
                    include: { kyc: true }
                }
            }
        });

        // 4. Handle propertyId logic: if unfilled (same as the id)
        const typedProperty = property as any;
        if (!typedProperty.propertyId) {
            await tx.property.update({
                where: { id: property.id },
                data: { propertyId: property.id.toString() }
            });
            typedProperty.propertyId = property.id.toString();
        }

        return typedProperty;
    });
}


