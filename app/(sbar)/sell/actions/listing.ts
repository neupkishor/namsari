"use server";

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createPropertyListing } from '@/lib/services/property';
import { logActivity } from '@/lib/activity';
import { publishPropertyDraft } from './drafts';
import { getAgencyConfigByAgencyId } from '@/actions/agency-config';
import { formatRoadSizeValue, getConfiguredDefaultUnit, normalizeAgencyConfig, resolveActiveAgencyId } from '@/lib/agency-config';

export async function createListing(formData: FormData) {
    const session = await getSession();
    if (!session || !session.id) {
        redirect('/auth/login');
    }

    const userId = Number(session.id);
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    const agencyId = resolveActiveAgencyId(currentUser, session.operatingId);
    const agencyConfig = agencyId ? await getAgencyConfigByAgencyId(agencyId) : null;
    const normalizedAgencyConfig = normalizeAgencyConfig(agencyConfig);

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
    const roadSize = formatRoadSizeValue(formData.get('roadSize') as string || '', agencyConfig) || undefined;
    const facingDirection = formData.get('facingDirection') as string || undefined;

    // 4. Location Information
    const defaultLocation = normalizedAgencyConfig?.defaultLocation || {};
    const province = (formData.get('province') as string) || defaultLocation.province || '';
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined;
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined;
    const district = (formData.get('district') as string) || defaultLocation.district || '';
    const cityVillage = (formData.get('cityVillage') as string) || defaultLocation.cityVillage || '';
    const area = (formData.get('area') as string) || defaultLocation.area || '';
    const ward = (formData.get('ward') as string) || defaultLocation.ward || undefined;
    const landmark = (formData.get('landmark') as string) || defaultLocation.landmark || undefined;
    const distanceFrom = formData.get('distanceFrom') as string || undefined;

    // 5. Pricing Details
    const negotiable = formData.get('negotiable') === 'on' || formData.get('negotiable') === null;
    const pricingType = formData.get('pricingType') as string; // flat, perUnit
    const unit = (formData.get('unit') as string) || getConfiguredDefaultUnit(agencyConfig, 'pricing') || undefined;

    // 6. Open House
    const markOpenHouse = formData.get('markOpenHouse') === 'on';
    const openHouseDateStr = formData.get('openHouse_date') as string;
    const openHouse_date = openHouseDateStr ? new Date(openHouseDateStr) : undefined;
    const openHouse_start = formData.get('openHouse_start') as string || undefined;
    const openHouse_end = formData.get('openHouse_end') as string || undefined;

    // 7. Amenities & Nearby Locations
    const selectedAmenities = formData.getAll('amenities') as string[];
    const amenityTypes = selectedAmenities.map(type => ({ type }));

    const nearbyNames = formData.getAll('nearby_location_name') as string[];
    const nearbyDistances = formData.getAll('nearby_location_distance') as string[];
    const nearbyAmenities = nearbyNames.map((name, idx) => ({
        type: 'landmark',
        name,
        distance: nearbyDistances[idx] ? `${nearbyDistances[idx]}m` : undefined
    }));

    const amenities = [...amenityTypes, ...nearbyAmenities];

    // 8. Media
    const imageUrls = formData.getAll('image_url') as string[];
    const imageOfs = formData.getAll('image_of') as string[];
    const images = imageUrls.map((url, index) => ({
        url,
        imageOf: imageOfs[index] || 'other',
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${imageOfs[index] || 'other'}-${Date.now()}-${index}`
    }));

    const status = normalizedAgencyConfig?.reviewRequired ? 'pending' : 'approved';

    if (normalizedAgencyConfig?.minPhotoCount && images.length < normalizedAgencyConfig.minPhotoCount) {
        throw new Error(`Minimum ${normalizedAgencyConfig.minPhotoCount} photos are required for this agency.`);
    }

    const requiredFieldValues: Record<string, unknown> = {
        propertyType: types,
        propertyPurpose: purposes,
        propertyNature: natures,
        title,
        province,
        district,
        cityVillage,
        area,
        ward,
        landmark,
        roadType,
        roadSize,
        facingDirection,
        pricingType,
        unit,
        price,
        priceNegotiable,
        rentPrice,
        bedrooms: formData.get('bedrooms'),
        bathrooms: formData.get('bathrooms'),
        kitchens: formData.get('kitchens'),
        livingRooms: formData.get('livingRooms'),
        floorNumber: formData.get('floorNumber'),
        totalFloors: formData.get('totalFloors'),
        builtUpArea: formData.get('builtUpArea'),
        builtUpAreaUnit: formData.get('builtUpAreaUnit') || getConfiguredDefaultUnit(agencyConfig, 'builtUpArea'),
        image_url: imageUrls,
    };

    const missingFields = (normalizedAgencyConfig?.compulsoryFields || []).filter((field) => {
        const scalarValue = requiredFieldValues[field];
        if (Array.isArray(scalarValue)) {
            return scalarValue.length === 0;
        }

        if (scalarValue === null || scalarValue === undefined) {
            return true;
        }

        return String(scalarValue).trim().length === 0;
    });

    if (missingFields.length > 0) {
        throw new Error(`Missing compulsory fields: ${missingFields.join(', ')}`);
    }

    // Helper to parse numeric values safely
    const parseNum = (val: any) => (val && val !== '') ? Number(val) : undefined;
    const parseFloatNum = (val: any) => (val && val !== '') ? parseFloat(val.toString().replace(/[^0-9.-]+/g, "")) : undefined;

    // 9. Features (Varying by type)
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
    const draftIdValue = formData.get('draftId');
    const draftId = draftIdValue ? Number(draftIdValue) : null;

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
            locationData: {
                country: 'Nepal',
                province,
                district,
                cityVillage,
                area,
                ward,
                landmark,
                distanceFrom,
                latitude,
                longitude
            },
            location: {
                province,
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
            amenities,
            images,
            features
        });

            status,
        await logActivity({
            activity_type: 'create_property',
            description: `Created property listing: ${title}`,
            account_id: userId,
        });

        if (draftId && Number.isFinite(draftId)) {
            try {
                await publishPropertyDraft(draftId);
            } catch (draftError) {
                console.warn('Failed to mark property draft as published:', draftError);
            }
        }
    } catch (error: any) {
        console.error("Failed to add property:", error);
        throw new Error("Failed to create listing: " + (error.message || error));
    }

    redirect('/');
}
