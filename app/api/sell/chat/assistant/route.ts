import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getDefaultPropertyPriceRate } from '@/lib/pricing';
import { runPropertyChatTurn } from '@/lib/ai/property-chat';

function normalizeNumber(value: unknown) {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

async function getPropertyChatUserContext(userId: number) {
    const [user, properties, requirements] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                type: true,
            },
        }),
        prisma.property.findMany({
            where: { listedById: userId },
            orderBy: { created_on: 'desc' },
            take: 8,
            select: {
                id: true,
                title: true,
                status: true,
                soldStatus: true,
                price: true,
                types: { select: { name: true } },
                purposes: { select: { name: true } },
                location: {
                    select: {
                        district: true,
                        cityVillage: true,
                        area: true,
                    },
                },
            },
        }),
        prisma.requirement.findMany({
            where: { userId },
            orderBy: { created_at: 'desc' },
            take: 8,
            select: {
                id: true,
                content: true,
                propertyTypes: true,
                purposes: true,
                district: true,
                cityVillage: true,
                area: true,
                minPrice: true,
                maxPrice: true,
                pricingUnit: true,
                status: true,
            },
        }),
    ]);

    return {
        user: user || { id: userId, name: null, username: null, type: null },
        properties: properties.map((property) => ({
            id: property.id,
            title: property.title,
            status: property.status,
            soldStatus: property.soldStatus,
            price: property.price,
            types: property.types.map((type) => type.name),
            purposes: property.purposes.map((purpose) => purpose.name),
            district: property.location?.district || null,
            cityVillage: property.location?.cityVillage || null,
            area: property.location?.area || null,
        })),
        requirements,
    };
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session?.id) {
        return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const userId = Number(session.id);
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const draft = body.draft || {};
    const defaultRate = body.defaultRate || getDefaultPropertyPriceRate(draft.types || [], draft.purposes || []);
    const userContext = await getPropertyChatUserContext(userId);

    const response = await runPropertyChatTurn({
        messages,
        draft,
        defaultRate,
        userContext,
    });
    const responseDefaultRate = getDefaultPropertyPriceRate(response.draft.types || [], response.draft.purposes || []);

    const createPayload = response.readyToCreate
        ? {
            title: String(response.draft.title || '').trim(),
            types: Array.isArray(response.draft.types) ? response.draft.types : [],
            purposes: Array.isArray(response.draft.purposes) ? response.draft.purposes : [],
            natures: Array.isArray(response.draft.natures) && response.draft.natures.length > 0
                ? response.draft.natures
                : undefined,
            isPrivate: Boolean(response.draft.isPrivate),
            remarks: response.draft.remarks || undefined,
            roadType: response.draft.roadType || undefined,
            roadSize: response.draft.roadSize || undefined,
            facingDirection: response.draft.facingDirection || undefined,
            location: {
                country: response.draft.location?.country || 'Nepal',
                province: String(response.draft.location?.province || ''),
                district: String(response.draft.location?.district || ''),
                cityVillage: String(response.draft.location?.cityVillage || ''),
                area: response.draft.location?.area || undefined,
                ward: response.draft.location?.ward || undefined,
                landmark: response.draft.location?.landmark || undefined,
                distanceFrom: response.draft.location?.distanceFrom || undefined,
                latitude: normalizeNumber(response.draft.location?.latitude),
                longitude: normalizeNumber(response.draft.location?.longitude),
            },
            locationData: response.draft.location
                ? {
                    country: response.draft.location.country || 'Nepal',
                    province: response.draft.location.province || '',
                    district: response.draft.location.district || '',
                    cityVillage: response.draft.location.cityVillage || '',
                    area: response.draft.location.area || '',
                    ward: response.draft.location.ward || '',
                    landmark: response.draft.location.landmark || '',
                    distanceFrom: response.draft.location.distanceFrom || '',
                    latitude: response.draft.location.latitude,
                    longitude: response.draft.location.longitude,
                }
                : undefined,
            price: {
                price: normalizeNumber(response.draft.price?.price) || 0,
                rate: response.draft.price?.rate || responseDefaultRate,
                unit: response.draft.price?.unit || undefined,
                totalUnit: normalizeNumber(response.draft.price?.totalUnit),
                totalPrice: normalizeNumber(response.draft.price?.totalPrice),
            },
            detailedPrice: Array.isArray(response.draft.detailedPrice)
                ? response.draft.detailedPrice.map((entry) => ({
                    price: normalizeNumber(entry.price) || 0,
                    rate: entry.rate || 'total',
                    unit: entry.unit || undefined,
                    totalUnit: normalizeNumber(entry.totalUnit),
                    totalPrice: normalizeNumber(entry.totalPrice),
                }))
                : [],
            amenities: Array.isArray(response.draft.amenities) ? response.draft.amenities : [],
            images: Array.isArray(response.draft.images) ? response.draft.images : [],
            features: response.draft.features || undefined,
            openHouse: response.draft.openHouse
                ? {
                    markOpenHouse: Boolean(response.draft.openHouse.markOpenHouse),
                    date: response.draft.openHouse.date,
                    startTime: response.draft.openHouse.startTime || undefined,
                    endTime: response.draft.openHouse.endTime || undefined,
                    latitude: normalizeNumber(response.draft.openHouse.latitude),
                    longitude: normalizeNumber(response.draft.openHouse.longitude),
                }
                : undefined,
        }
        : null;

    return NextResponse.json({
        assistantMessage: response.assistantMessage,
        draft: response.draft,
        missingFields: response.missingFields,
        readyToCreate: response.readyToCreate,
        createPayload,
    });
}
