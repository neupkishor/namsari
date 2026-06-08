import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createPropertyListing } from '@/lib/services/property';
import { getDefaultPropertyPriceRate } from '@/lib/pricing';
import { revalidatePath } from 'next/cache';

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
    const purposes = Array.isArray(body.purposes) ? body.purposes.filter(Boolean).map(String) : [];
    const location = body.location || {};
    const primaryRate = String(body.price?.rate || getDefaultPropertyPriceRate(types, purposes));

    if (!title || types.length === 0 || purposes.length === 0 || !String(location.district || '').trim() || !String(location.cityVillage || '').trim()) {
        return NextResponse.json({ error: 'Missing required listing information' }, { status: 400 });
    }

    const created = await createPropertyListing({
        title,
        types,
        purposes,
        natures: Array.isArray(body.natures) && body.natures.length > 0 ? body.natures : inferNatures(types),
        isPrivate: Boolean(body.isPrivate),
        remarks: body.remarks || undefined,
        roadType: body.roadType || undefined,
        roadSize: body.roadSize || undefined,
        facingDirection: body.facingDirection || undefined,
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
        detailedPrice: Array.isArray(body.detailedPrice)
            ? body.detailedPrice.map((entry: any) => ({
                price: normalizeOptionalNumber(entry?.price) || 0,
                rate: String(entry?.rate || 'total') as any,
                unit: entry?.unit || undefined,
                totalUnit: normalizeOptionalNumber(entry?.totalUnit),
                totalPrice: normalizeOptionalNumber(entry?.totalPrice),
            }))
            : [],
        openHouse: body.openHouse,
        listedById: userId,
        amenities: Array.isArray(body.amenities) ? body.amenities : [],
        images: Array.isArray(body.images) ? body.images : [],
        features: body.features || undefined,
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

    const existing = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            location: true,
            features: true,
            openHouse: true,
            images: true,
            types: true,
            purposes: true,
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
    const purposes = normalizeStringArray(body.purposes);
    const natures = normalizeStringArray(body.natures);
    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : undefined;
    const location = body.location || undefined;
    const pricePatch = body.price || undefined;
    const features = body.features || undefined;
    const openHouse = body.openHouse || undefined;
    const images = Array.isArray(body.images) ? body.images : undefined;
    const amenities = Array.isArray(body.amenities) ? body.amenities : undefined;

    const nextPrice = pricePatch
        ? cleanUndefined({
            ...((existing.price || {}) as Record<string, unknown>),
            price: normalizeOptionalNumber(pricePatch.price),
            rate: pricePatch.rate ? String(pricePatch.rate) : undefined,
            unit: pricePatch.unit ? String(pricePatch.unit) : undefined,
            totalUnit: normalizeOptionalNumber(pricePatch.totalUnit),
            totalPrice: normalizeOptionalNumber(pricePatch.totalPrice),
        })
        : undefined;

    const detailedPrice = Array.isArray(body.detailedPrice)
        ? body.detailedPrice.map((entry: any) => cleanUndefined({
            price: normalizeOptionalNumber(entry?.price) || 0,
            rate: String(entry?.rate || 'total'),
            unit: entry?.unit || undefined,
            totalUnit: normalizeOptionalNumber(entry?.totalUnit),
            totalPrice: normalizeOptionalNumber(entry?.totalPrice),
        }))
        : undefined;

    const mediaPayload = images
        ? {
            images: images.map((img: any, idx: number) => ({
                kind: 'image',
                url: img.url,
                label: img.imageOf,
                filename: img.filename,
                sort: idx + 1,
            })),
            videos: [],
        }
        : undefined;

    const updated = await prisma.$transaction(async (tx) => {
        if (images) {
            await tx.propertyImage.deleteMany({ where: { propertyId } });
            if (images.length > 0) {
                await tx.propertyImage.createMany({
                    data: images.map((img: any) => ({
                        propertyId,
                        url: String(img.url),
                        imageOf: String(img.imageOf || 'property'),
                        filename: String(img.filename || `prop_${propertyId}_${Date.now()}`),
                    })),
                });
            }
        }

        const data: any = cleanUndefined({
            title,
            slug: title
                ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                : undefined,
            isPrivate: typeof body.isPrivate === 'boolean' ? body.isPrivate : undefined,
            status: ['pending', 'approved', 'rejected', 'warned'].includes(String(body.status || '')) ? String(body.status) : undefined,
            soldStatus: ['unsold', 'soldByUs', 'soldByOther'].includes(String(body.soldStatus || '')) ? String(body.soldStatus) : undefined,
            remarks: typeof body.remarks === 'string' ? body.remarks : undefined,
            roadType: typeof body.roadType === 'string' ? body.roadType : undefined,
            roadSize: typeof body.roadSize === 'string' ? body.roadSize : undefined,
            facingDirection: typeof body.facingDirection === 'string' ? body.facingDirection : undefined,
            price: nextPrice,
            detailedPrice,
            amenities,
            media: mediaPayload,
            mainMedia: images && images.length > 0 ? images[0].url : undefined,
            types: relationUpdate(types),
            purposes: relationUpdate(purposes),
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
                images: true,
                types: true,
                purposes: true,
                natures: true,
            },
        });
    });

    revalidatePath('/');
    revalidatePath('/manage/properties');
    revalidatePath(propertyManagePath(updated));

    return NextResponse.json({ success: true, property: updated });
}
