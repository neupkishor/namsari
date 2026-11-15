import { NextResponse } from 'next/server';
import prisma from '@neup/core/database/prisma';
import { getSession } from '@/services/auth/session';
import { createPropertyListing } from '@/services/properties/property';
import { getDefaultPropertyPriceRate } from '@/services/properties/pricing';
import { revalidatePath } from 'next/cache';
import { convertAreaToSquareMeters } from '@/services/properties/area-units';
import { convertLengthToMeters } from '@/services/properties/length-units';

function inferNatures(types: string[]) {
    const normalized = types.map((type) => type.toLowerCase());

    if (normalized.includes('commercial space')) return ['commercial'];
    if (normalized.includes('land')) return ['residential'];
    if (normalized.some((type) => ['house', 'bungalow', 'villa', 'multiplex', 'apartment', 'penthouse'].includes(type))) {
        return ['residential'];
    }

    return ['commercial'];
}

function normalizeOptionalNumber(value: unknown) {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

// Parses chat measurements that may include their unit in the value string.
function parseMeasurement(value: unknown, unitHint: unknown, defaultUnit: string) {
    const text = String(value ?? '').trim();
    const match = text.match(/^([+-]?(?:\d+\.?\d*|\.\d+))\s*([a-zA-Z².' ]*)$/);
    const numericValue = normalizeOptionalNumber(value) ?? (match ? Number(match[1]) : undefined);

    return numericValue === undefined
        ? null
        : { value: numericValue, unit: String(unitHint || match?.[2] || defaultUnit).trim() };
}

// Converts a chat payload's built-up area to the canonical square-meter value.
function normalizeFeaturesForStorage(features: any) {
    if (!features || typeof features !== 'object') return features;

    const { builtUpArea, builtUpAreaUnit, ...otherFeatures } = features;
    const parsedArea = parseMeasurement(builtUpArea, builtUpAreaUnit, 'aana');

    return {
        ...otherFeatures,
        ...(builtUpArea === null ? { builtUpArea: null } : {}),
        ...(parsedArea ? { builtUpArea: convertAreaToSquareMeters(parsedArea.value, parsedArea.unit) } : {}),
    };
}

// Converts a chat payload's road width to meters.
function normalizeRoadSizeForStorage(value: unknown, unitHint?: unknown) {
    const parsedSize = parseMeasurement(value, unitHint, 'ft');
    return parsedSize ? convertLengthToMeters(parsedSize.value, parsedSize.unit) : undefined;
}

function cleanUndefined<T extends Record<string, any>>(value: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(value).filter(([, entry]) => entry !== undefined)
    ) as Partial<T>;
}

function normalizeStringArray(value: unknown) {
    return Array.isArray(value)
        ? value.map(String).map((item) => item.trim()).filter(Boolean)
        : undefined;
}

function relationUpdate(names: string[] | undefined) {
    if (!names) return undefined;

    return {
        set: [],
        connectOrCreate: names.map((name) => ({
            where: { name },
            create: { name },
        })),
    };
}

function propertyManagePath(property: { id: number; slug?: string | null; title?: string | null }) {
    const slug = property.slug || String(property.title || 'property')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return `/manage/properties/${slug}-${property.id}`;
}

function normalizeText(value: unknown) {
    return String(value || '').trim().toLowerCase();
}

function normalizeTextArray(value: unknown) {
    return Array.isArray(value)
        ? value.map(normalizeText).filter(Boolean).sort()
        : [];
}

function arraysOverlap(left: string[], right: string[]) {
    if (left.length === 0 || right.length === 0) return false;
    const rightSet = new Set(right);
    return left.some((item) => rightSet.has(item));
}

function comparableNumber(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function pricesAreSimilar(left: unknown, right: unknown) {
    const leftPrice = comparableNumber((left as any)?.price);
    const rightPrice = comparableNumber((right as any)?.price);
    if (leftPrice === undefined || rightPrice === undefined) return false;
    if (leftPrice === 0 || rightPrice === 0) return leftPrice === rightPrice;

    const difference = Math.abs(leftPrice - rightPrice);
    return difference / Math.max(leftPrice, rightPrice) <= 0.05;
}

function valuesMatch(left: unknown, right: unknown) {
    const normalizedLeft = normalizeText(left);
    const normalizedRight = normalizeText(right);
    return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

function numericValuesMatch(left: unknown, right: unknown) {
    const leftNumber = comparableNumber(left);
    const rightNumber = comparableNumber(right);
    return leftNumber !== undefined && rightNumber !== undefined && leftNumber === rightNumber;
}

function existingPropertySummary(property: any) {
    const location = [property.location?.area, property.location?.cityVillage, property.location?.district].filter(Boolean).join(', ');
    const types = property.types?.map((type: any) => type.name).filter(Boolean).join(', ');
    const purpose = property.purpose;
    const price = comparableNumber(property.price_listed);

    return [
        property.title ? `#${property.id} ${property.title}` : `#${property.id}`,
        location ? `at ${location}` : '',
        types ? `(${[types, purpose].filter(Boolean).join(' / ')})` : '',
        price !== undefined ? `priced at ${price}` : '',
    ].filter(Boolean).join(' ');
}

function isLikelyDuplicateProperty(input: {
    types: string[];
    purpose: string;
    location: any;
    price: any;
    features: any;
    roadType?: unknown;
    roadSize?: unknown;
    facingDirection?: unknown;
}, existing: any) {
    const existingTypes = normalizeTextArray(existing.types?.map((type: any) => type.name));
    const existingPurpose = normalizeText(existing.purpose);
    const inputTypes = normalizeTextArray(input.types);
    const inputPurpose = normalizeText(input.purpose);

    if (!arraysOverlap(inputTypes, existingTypes) || inputPurpose !== existingPurpose) {
        return false;
    }

    const sameDistrict = valuesMatch(input.location?.district, existing.location?.district);
    const sameCity = valuesMatch(input.location?.cityVillage, existing.location?.cityVillage);
    if (!sameDistrict || !sameCity) return false;

    let matchingDetails = 0;
    let knownDetails = 0;
    let conflictingDetails = 0;

    const compareDetail = (left: unknown, right: unknown, numeric = false) => {
        if ((left === undefined || left === null || left === '') || (right === undefined || right === null || right === '')) return;
        knownDetails += 1;
        if (numeric ? numericValuesMatch(left, right) : valuesMatch(left, right)) {
            matchingDetails += 1;
        } else {
            conflictingDetails += 1;
        }
    };

    compareDetail(input.location?.area, existing.location?.area);
    compareDetail(input.location?.ward, existing.location?.ward);
    compareDetail(input.location?.landmark, existing.location?.landmark);
    compareDetail(input.roadType, existing.roadType);
    compareDetail(input.roadSize, existing.roadSize);
    compareDetail(input.facingDirection, existing.facingDirection);
    compareDetail(input.features?.bedrooms, existing.features?.bedrooms, true);
    compareDetail(input.features?.bathrooms, existing.features?.bathrooms, true);
    compareDetail(input.features?.kitchens, existing.features?.kitchens, true);
    compareDetail(input.features?.livingRooms, existing.features?.livingRooms, true);
    compareDetail(input.features?.floorNumber, existing.features?.floorNumber, true);
    compareDetail(input.features?.totalFloors, existing.features?.totalFloors, true);
    const normalizedFeatures = normalizeFeaturesForStorage(input.features);
    compareDetail(normalizedFeatures?.builtUpArea, existing.features?.builtUpArea, true);

    const similarPrice = pricesAreSimilar(input.price, { price: existing.price_listed });
    if (similarPrice) matchingDetails += 1;

    if (conflictingDetails > 0) return false;

    const enoughSameDetails = matchingDetails >= 3;
    const sparseButSame = knownDetails <= 2 && similarPrice;

    return enoughSameDetails || sparseButSame;
}

async function findLikelyDuplicateProperty(input: {
    listedById: number;
    types: string[];
    purpose: string;
    location: any;
    price: any;
    features: any;
    roadType?: unknown;
    roadSize?: unknown;
    facingDirection?: unknown;
}) {
    const existingProperties = await prisma.property.findMany({
        where: {
            listedById: input.listedById,
            saleStatuses: { none: { status: 'soldByUs' } },
        },
        orderBy: { created_on: 'desc' },
        take: 50,
        include: {
            location: true,
            features: true,
        },
    });

    return existingProperties.find((property) => isLikelyDuplicateProperty(input, property)) || null;
}

export async function POST(request: Request) {
    const session = await getSession();

    if (!session?.id) {
        return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const userId = Number(session.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const title = String(body.title || '').trim();
    const types = Array.isArray(body.types) ? body.types.filter(Boolean).map(String) : [];
    const purposeValue = String(body.purpose || body.purposes?.[0] || '');
    const purpose = purposeValue === 'sale' ? 'sell' : purposeValue;
    const location = body.location || {};
    const primaryRate = String(body.price?.rate || getDefaultPropertyPriceRate(types, [purpose]));

    if (!title || types.length === 0 || !['sell', 'rent'].includes(purpose) || !String(location.district || '').trim() || !String(location.cityVillage || '').trim()) {
        return NextResponse.json({ error: 'Missing required listing information' }, { status: 400 });
    }

    const duplicate = await findLikelyDuplicateProperty({
        listedById: userId,
        types,
        purpose,
        location,
        price: body.price,
        features: body.features || {},
        roadType: body.roadType,
        roadSize: normalizeRoadSizeForStorage(body.roadSize, body.roadSizeUnit),
        facingDirection: body.facingDirection,
    });

    const duplicateDifferentiator = String(body.duplicatePropertyDifferentiator || '').trim();

    if (duplicate && Number(body.duplicatePropertyConfirmationId) !== duplicate.id && duplicateDifferentiator.length < 8) {
        const duplicateSummary = existingPropertySummary(duplicate);

        return NextResponse.json({
            success: false,
            error: 'duplicate_property_confirmation_required',
            duplicateProperty: {
                id: duplicate.id,
                title: duplicate.title,
                path: propertyManagePath(duplicate),
            },
            assistantMessage: `This looks very similar to your existing property ${duplicateSummary}. Please share what is different about this property. If it is truly a separate listing with the same details, reply "yes, create another listing for property #${duplicate.id}".`,
        }, { status: 409 });
    }

    const created = await createPropertyListing({
        title,
        types,
        purpose,
        natures: Array.isArray(body.natures) && body.natures.length > 0 ? body.natures : inferNatures(types),
        remarks: body.remarks || undefined,
        roadType: body.roadType || undefined,
        roadSize: normalizeRoadSizeForStorage(body.roadSize, body.roadSizeUnit),
        facingDirection: body.facingDirection || undefined,
        status: 'pending',
        location: {
            country: String(location.country || 'Nepal'),
            province: String(location.province || ''),
            district: String(location.district),
            cityVillage: String(location.cityVillage),
            area: location.area || undefined,
            ward: location.ward || undefined,
            landmark: location.landmark || undefined,
            distanceFrom: location.distanceFrom || undefined,
            latitude: normalizeOptionalNumber(location.latitude),
            longitude: normalizeOptionalNumber(location.longitude),
        },
        locationData: body.locationData || undefined,
        price: {
            price: normalizeOptionalNumber(body.price?.price) || 0,
            rate: primaryRate as any,
            unit: body.price?.unit || undefined,
            totalUnit: normalizeOptionalNumber(body.price?.totalUnit),
            totalPrice: normalizeOptionalNumber(body.price?.totalPrice),
        },
        pricing: { price: normalizeOptionalNumber(body.price?.price) || 0, negotiable: Boolean(body.price?.negotiable) },
        openHouse: body.openHouse,
        listedById: userId,
        amenities: Array.isArray(body.amenities) ? body.amenities : [],
        images: Array.isArray(body.images) ? body.images : [],
        features: normalizeFeaturesForStorage(body.features) || undefined,
    });

    return NextResponse.json({ success: true, property: created });
}

export async function PATCH(request: Request) {
    const session = await getSession();

    if (!session?.id) {
        return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const userId = Number(session.id);
    const body = await request.json();
    const propertyId = normalizeOptionalNumber(body.propertyId);

    if (!propertyId) {
        return NextResponse.json({ error: 'Property id is required' }, { status: 400 });
    }

    const existing: any = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            location: true,
            features: true,
            openHouse: true,
            propertyMedia: true,
            natures: true,
        },
    });

    if (!existing) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existing.listedById !== userId) {
        return NextResponse.json({ error: 'You can only edit properties you own' }, { status: 403 });
    }

    const types = normalizeStringArray(body.types);
    const purposeValue = String(body.purpose || body.purposes?.[0] || '');
    const purpose = purposeValue === 'sale' ? 'sell' : purposeValue;
    const natures = normalizeStringArray(body.natures);
    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : undefined;
    const location = body.location || undefined;
    const pricePatch = body.price || undefined;
    const priceNegotiable = typeof body.price?.negotiable === 'boolean' ? body.price.negotiable : undefined;
    const features = normalizeFeaturesForStorage(body.features) || undefined;
    const openHouse = body.openHouse || undefined;
    const images = Array.isArray(body.images) ? body.images : undefined;
    const amenities = Array.isArray(body.amenities) ? body.amenities : undefined;

    const nextPrice = pricePatch ? {
        price_listed: normalizeOptionalNumber(pricePatch.price) ?? null,
        price_basis: String(pricePatch.rate || existing.price_basis || 'total'),
    } : undefined;

    const mediaPayload = images
        ? {
            images: [
                ...(((existing.media as any)?.images || []).filter((item: any) => item?.url)),
                ...images.map((img: any, idx: number) => ({
                    kind: 'image',
                    url: img.url,
                    label: img.imageOf,
                    filename: img.filename,
                    sort: ((existing.media as any)?.images?.length || 0) + idx + 1,
                })),
            ],
            videos: ((existing.media as any)?.videos || []).filter((item: any) => item?.url),
        }
        : undefined;

    const updated = await prisma.$transaction(async (tx) => {
        if (images) {
            if (images.length > 0) {
                await tx.propertyMedia.createMany({
                    data: images.map((img: any) => ({
                        propertyId,
                        resourceUrl: String(img.url),
                        type: 'image',
                        index: 0,
                    })),
                });
            }
        }

        const data: any = cleanUndefined({
            title,
            slug: title
                ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                : undefined,
            status: ['pending', 'rejected', 'warned'].includes(String(body.status || '')) ? String(body.status) : undefined,
            saleStatuses: body.soldStatus && ['unsold', 'soldByUs', 'soldByOther'].includes(String(body.soldStatus))
                ? { create: { status: String(body.soldStatus) } }
                : undefined,
            remarks: typeof body.remarks === 'string' ? body.remarks : undefined,
            roadType: typeof body.roadType === 'string' ? body.roadType : undefined,
            roadSize: normalizeRoadSizeForStorage(body.roadSize, body.roadSizeUnit),
            facingDirection: typeof body.facingDirection === 'string' ? body.facingDirection : undefined,
            ...(nextPrice || {}),
            ...(priceNegotiable !== undefined ? { price_negotiable: priceNegotiable } : {}),
            propertyAmmenities: amenities ? {
                deleteMany: {},
                create: amenities.map((amenity: any) => ({
                    ammenity: { connectOrCreate: { where: { id: Number(amenity.id) || -1 }, create: { name: String(amenity.name || amenity.type || ''), status: 'active' } } },
                    status: String(amenity.status || 'active').slice(0, 24),
                })),
            } : undefined,
            media: mediaPayload,
            mainMedia: images && images.length > 0 ? images[0].url : undefined,
            types: relationUpdate(types),
            purpose,
            natures: relationUpdate(natures),
            location: location
                ? {
                    upsert: {
                        create: {
                            country: String(location.country || 'Nepal'),
                            province: String(location.province || existing.location?.province || ''),
                            district: String(location.district || existing.location?.district || ''),
                            cityVillage: String(location.cityVillage || existing.location?.cityVillage || ''),
                            area: location.area || existing.location?.area || undefined,
                            ward: location.ward || existing.location?.ward || undefined,
                            landmark: location.landmark || existing.location?.landmark || undefined,
                            distanceFrom: location.distanceFrom || existing.location?.distanceFrom || undefined,
                            latitude: normalizeOptionalNumber(location.latitude) ?? existing.location?.latitude ?? undefined,
                            longitude: normalizeOptionalNumber(location.longitude) ?? existing.location?.longitude ?? undefined,
                        },
                        update: cleanUndefined({
                            country: location.country ? String(location.country) : undefined,
                            province: location.province ? String(location.province) : undefined,
                            district: location.district ? String(location.district) : undefined,
                            cityVillage: location.cityVillage ? String(location.cityVillage) : undefined,
                            area: location.area,
                            ward: location.ward,
                            landmark: location.landmark,
                            distanceFrom: location.distanceFrom,
                            latitude: normalizeOptionalNumber(location.latitude),
                            longitude: normalizeOptionalNumber(location.longitude),
                        }),
                    },
                }
                : undefined,
            features: features
                ? {
                    upsert: {
                        create: cleanUndefined(features),
                        update: cleanUndefined(features),
                    },
                }
                : undefined,
            openHouse: openHouse
                ? {
                    upsert: {
                        create: cleanUndefined({
                            markOpenHouse: typeof openHouse.markOpenHouse === 'boolean' ? openHouse.markOpenHouse : false,
                            date: openHouse.date ? new Date(openHouse.date) : undefined,
                            startTime: openHouse.startTime,
                            endTime: openHouse.endTime,
                            latitude: normalizeOptionalNumber(openHouse.latitude),
                            longitude: normalizeOptionalNumber(openHouse.longitude),
                        }),
                        update: cleanUndefined({
                            markOpenHouse: typeof openHouse.markOpenHouse === 'boolean' ? openHouse.markOpenHouse : undefined,
                            date: openHouse.date ? new Date(openHouse.date) : undefined,
                            startTime: openHouse.startTime,
                            endTime: openHouse.endTime,
                            latitude: normalizeOptionalNumber(openHouse.latitude),
                            longitude: normalizeOptionalNumber(openHouse.longitude),
                        }),
                    },
                }
                : undefined,
        });

        return tx.property.update({
            where: { id: propertyId },
            data,
            include: {
                location: true,
                features: true,
                propertyMedia: true,
                natures: true,
            },
        });
    });

    revalidatePath('/');
    revalidatePath('/manage/properties');
    revalidatePath(propertyManagePath(updated));

    return NextResponse.json({ success: true, property: updated });
}
