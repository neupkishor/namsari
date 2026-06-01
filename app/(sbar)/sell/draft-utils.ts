import { getConfiguredDefaultUnit, mergeDraftDefaults } from '@/lib/agency-config';

export type PropertyDraftChanges = Record<string, any>;

export function createBlankPropertyDraftChanges(initialPurpose?: string, agencyConfig?: any): PropertyDraftChanges {
    const base = {
        selectedTypes: [],
        selectedPurposes: initialPurpose === 'sale' || initialPurpose === 'rent' ? [initialPurpose] : [],
        selectedNatures: [],
        pricingType: 'flat',
        pricingUnit: 'aana',
        uploadedImages: [],
        price: '',
        priceNegotiable: '',
        rentPrice: '',
        coords: { lat: '', lng: '' },
        locationSource: '',
        title: '',
        province: '',
        district: '',
        cityVillage: '',
        area: '',
        ward: '',
        landmark: '',
        nearbyLocations: [],
        roadType: 'Blacktopped',
        roadSize: '',
        facingDirection: 'East',
        furnishing: 'Unfurnished',
        builtUpAreaUnit: 'sqft',
        bedrooms: '',
        bathrooms: '',
        kitchens: '',
        livingRooms: '',
        floorNumber: '',
        totalFloors: '',
        builtUpArea: '',
        parkingAvailable: false,
        elevator: false,
        security: false,
        waterSupply: false,
        electricity: false,
        unlockedSections: [1],
        isTitleEdited: false,
    };

    return mergeDraftDefaults({
        ...base,
        builtUpAreaUnit: getConfiguredDefaultUnit(agencyConfig, 'builtUpArea') || base.builtUpAreaUnit,
    }, agencyConfig);
}

export function createPropertyDraftChangesFromProperty(property: any, initialPurpose?: string): PropertyDraftChanges {
    const location = property.location || {};
    const pricing = property.pricing || property.price || {};
    const features = property.features || {};

    return {
        ...createBlankPropertyDraftChanges(initialPurpose),
        doing: 'edit',
        selectedTypes: (property.types || []).map((item: any) => item.name).filter(Boolean),
        selectedPurposes: (property.purposes || []).map((item: any) => item.name).filter(Boolean),
        selectedNatures: (property.natures || []).map((item: any) => item.name).filter(Boolean),
        title: property.title || '',
        province: location.province || '',
        district: location.district || '',
        cityVillage: location.cityVillage || '',
        area: location.area || '',
        ward: location.ward || '',
        landmark: location.landmark || '',
        coords: {
            lat: location.latitude != null ? String(location.latitude) : '',
            lng: location.longitude != null ? String(location.longitude) : '',
        },
        locationSource:
            location.latitude != null && location.longitude != null
                ? `${location.latitude}, ${location.longitude}`
                : '',
        roadType: property.roadType || 'Blacktopped',
        roadSize: property.roadSize || '',
        facingDirection: property.facingDirection || 'East',
        furnishing: features.furnishing || 'Unfurnished',
        builtUpAreaUnit: features.builtUpAreaUnit || 'sqft',
        bedrooms: features.bedrooms != null ? String(features.bedrooms) : '',
        bathrooms: features.bathrooms != null ? String(features.bathrooms) : '',
        kitchens: features.kitchens != null ? String(features.kitchens) : '',
        livingRooms: features.livingRooms != null ? String(features.livingRooms) : '',
        floorNumber: features.floorNumber != null ? String(features.floorNumber) : '',
        totalFloors: features.totalFloors != null ? String(features.totalFloors) : '',
        builtUpArea: features.builtUpArea != null ? String(features.builtUpArea) : '',
        parkingAvailable: Boolean(features.parkingAvailable),
        elevator: Boolean(features.elevator),
        security: Boolean(features.security),
        waterSupply: Boolean(features.waterSupply),
        electricity: Boolean(features.electricity),
        pricingType: pricing.pricingType || 'flat',
        pricingUnit: pricing.unit || 'aana',
        price: pricing.price != null ? String(pricing.price) : '',
        priceNegotiable: pricing.priceNegotiable != null ? String(pricing.priceNegotiable) : '',
        rentPrice: pricing.rentPrice != null ? String(pricing.rentPrice) : '',
        uploadedImages: (property.images || []).map((image: any) => ({
            url: image.url,
            type: image.imageOf || 'other',
        })),
        unlockedSections: [1, 2, 3, 4],
        isTitleEdited: Boolean(property.title),
    };
}

export function normalizePropertyDraftChanges(changes: PropertyDraftChanges | null | undefined, initialPurpose?: string): PropertyDraftChanges {
    const base = createBlankPropertyDraftChanges(initialPurpose);

    return {
        ...base,
        ...(changes || {}),
        coords: {
            lat: String(changes?.coords?.lat || ''),
            lng: String(changes?.coords?.lng || ''),
        },
        selectedTypes: Array.isArray(changes?.selectedTypes) ? changes!.selectedTypes : [],
        selectedPurposes: Array.isArray(changes?.selectedPurposes) ? changes!.selectedPurposes : base.selectedPurposes,
        selectedNatures: Array.isArray(changes?.selectedNatures) ? changes!.selectedNatures : [],
        uploadedImages: Array.isArray(changes?.uploadedImages) ? changes!.uploadedImages : [],
        nearbyLocations: Array.isArray(changes?.nearbyLocations) ? changes!.nearbyLocations : [],
        unlockedSections: Array.isArray(changes?.unlockedSections) ? changes!.unlockedSections : [1],
        parkingAvailable: Boolean(changes?.parkingAvailable),
        elevator: Boolean(changes?.elevator),
        security: Boolean(changes?.security),
        waterSupply: Boolean(changes?.waterSupply),
        electricity: Boolean(changes?.electricity),
        isTitleEdited: Boolean(changes?.isTitleEdited),
    };
}