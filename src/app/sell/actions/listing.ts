"use server";

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createPropertyListing } from '@/lib/services/property';

export async function createListing(formData: FormData) {
    const session = await getSession();
    if (!session || !session.id) {
        redirect('/login');
    }

    const userId = Number(session.id);

    // 1. Basic Details
    const title = formData.get('title') as string;
    const types = formData.getAll('propertyType') as string[];
    const purposes = formData.getAll('propertyPurpose') as string[];
    const natures = formData.getAll('propertyNature') as string[];

    // 2. Listing Flags (Admin flags removed from UI)
    const isPrivate = formData.get('isPrivate') === 'on';
    const remarks = formData.get('remarks') as string || undefined;

    // 3. Road and Entrance
    const roadType = formData.get('roadType') as string || undefined;
    const roadSize = formData.get('roadSize') as string || undefined;
    const facingDirection = formData.get('facingDirection') as string || undefined;

    // 4. Location Information
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined;
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined;
    const district = formData.get('district') as string;
    const cityVillage = formData.get('cityVillage') as string;
    const area = formData.get('area') as string;
    const ward = formData.get('ward') as string || undefined;
    const landmark = formData.get('landmark') as string || undefined;
    const distanceFrom = formData.get('distanceFrom') as string || undefined;

    // 5. Pricing Details
    const negotiable = formData.get('negotiable') === 'on' || formData.get('negotiable') === null;
    const pricingType = formData.get('pricingType') as string; // flat, perUnit
    const unit = formData.get('unit') as string || undefined;

    // 6. Open House
    const markOpenHouse = formData.get('markOpenHouse') === 'on';
    const openHouseDateStr = formData.get('openHouse_date') as string;
    const openHouse_date = openHouseDateStr ? new Date(openHouseDateStr) : undefined;
    const openHouse_start = formData.get('openHouse_start') as string || undefined;
    const openHouse_end = formData.get('openHouse_end') as string || undefined;

    // 7. Owner/Authorized
    const ownerId = formData.get('ownerId') ? Number(formData.get('ownerId')) : userId;
    const authorizedPersonId = formData.get('authorizedPersonId') ? Number(formData.get('authorizedPersonId')) : undefined;

    // 8. Amenities
    const selectedAmenities = formData.getAll('amenities') as string[];
    const amenities = selectedAmenities.map(type => ({ type }));

    // 9. Media
    const imageUrls = formData.getAll('image_url') as string[];
    const imageOfs = formData.getAll('image_of') as string[];
    const images = imageUrls.map((url, index) => ({
        url,
        imageOf: imageOfs[index] || 'other',
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${imageOfs[index] || 'other'}-${Date.now()}-${index}`
    }));

    // Helper to parse numeric values safely
    const parseNum = (val: any) => (val && val !== '') ? Number(val) : undefined;
    const parseFloatNum = (val: any) => (val && val !== '') ? parseFloat(val.toString().replace(/[^0-9.-]+/g, "")) : undefined;

    // 10. Features (Varying by type)
    const features = {
        bedrooms: parseNum(formData.get('bedrooms')),
        bathrooms: parseNum(formData.get('bathrooms')),
        kitchens: parseNum(formData.get('kitchens')),
        livingRooms: parseNum(formData.get('livingRooms')),
        floorNumber: parseNum(formData.get('floorNumber')),
        totalFloors: parseNum(formData.get('totalFloors')),
        furnishing: formData.get('furnishing') as string || undefined,
        builtUpArea: parseFloatNum(formData.get('builtUpArea')),
        builtUpAreaUnit: formData.get('builtUpAreaUnit') as string || undefined,
        parkingAvailable: formData.get('parkingAvailable') === 'on',
        elevator: formData.get('elevator') === 'on',
        security: formData.get('security') === 'on',
        waterSupply: formData.get('waterSupply') === 'on',
        electricity: formData.get('electricity') === 'on',
    };

    // Pricing Details Refinement
    const price = parseFloatNum(formData.get('price')) || 0;
    const priceNegotiable = parseFloatNum(formData.get('priceNegotiable'));
    const rentPrice = parseFloatNum(formData.get('rentPrice'));

    try {
        await createPropertyListing({
            title,
            types,
            purposes,
            natures,
            isPrivate,
            remarks,
            roadType,
            roadSize,
            facingDirection,
            location: {
                latitude,
                longitude,
                district,
                cityVillage,
                area,
                ward,
                landmark,
                distanceFrom
            },
            pricing: {
                negotiable,
                pricingType,
                unit,
                price,
                priceNegotiable,
                rentPrice
            },
            openHouse: markOpenHouse ? {
                markOpenHouse: true,
                date: openHouse_date,
                startTime: openHouse_start,
                endTime: openHouse_end,
                latitude,
                longitude
            } : undefined,
            listedById: userId,
            ownerId,
            authorizedPersonId,
            amenities,
            images,
            features
        });
    } catch (error: any) {
        console.error("Failed to add property:", error);
        throw new Error("Failed to create listing: " + (error.message || error));
    }

    redirect('/');
}
