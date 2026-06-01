import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getDefaultPropertyPriceRate } from '@/lib/pricing';
import { AI_AGENT_OCCUPIED_MESSAGE, runPropertyChatTurn } from '@/lib/ai/property-chat';

const MAX_AUDIO_BYTES = 12 * 1024 * 1024;

function normalizeNumber(value: unknown) {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function parseAudioInput(value: any) {
    if (!value) return undefined;
    const dataUrl = typeof value.dataUrl === 'string' ? value.dataUrl : '';
    const mimeType = typeof value.mimeType === 'string' ? value.mimeType : '';
    const durationSeconds = Number(value.durationSeconds);
    const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
    const approxBytes = Math.ceil((base64.length * 3) / 4);

    if (!dataUrl.startsWith('data:audio/') || !mimeType.startsWith('audio/') || approxBytes <= 0) {
        throw new Error('Invalid audio recording');
    }

    if (Number.isFinite(durationSeconds) && durationSeconds > 60) {
        throw new Error('Audio recording must be 1 minute or less');
    }

    if (approxBytes > MAX_AUDIO_BYTES) {
        throw new Error('Audio recording is too large');
    }

    return {
        dataUrl,
        mimeType,
        durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : undefined,
    };
}

function formatPriceForTitle(value: unknown) {
    const price = normalizeNumber(value);
    if (!price) return '';
    if (price >= 10000000) return `${price / 10000000} crore`;
    if (price >= 100000) return `${price / 100000} lakh`;
    return `NPR ${price}`;
}

function buildGeneratedListingTitle(draft: any) {
    const type = Array.isArray(draft.types) && draft.types[0] ? String(draft.types[0]) : 'Property';
    const purpose = Array.isArray(draft.purposes) && draft.purposes[0] ? String(draft.purposes[0]) : '';
    const location = [draft.location?.cityVillage, draft.location?.district].filter(Boolean).join(', ');
    const purposeLabel = purpose === 'rent' ? 'for Rent' : purpose === 'sale' ? 'for Sale' : '';

    return [type, purposeLabel, location ? `in ${location}` : ''].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function buildGeneratedRemarks(draft: any) {
    const title = buildGeneratedListingTitle(draft);
    const price = formatPriceForTitle(draft.price?.price);
    const rate = draft.price?.rate ? String(draft.price.rate) : '';
    const unit = draft.price?.unit ? ` per ${draft.price.unit}` : '';
    const location = [draft.location?.area, draft.location?.cityVillage, draft.location?.district].filter(Boolean).join(', ');
    const details = [
        title,
        location ? `Located at ${location}.` : '',
        price ? `Price: ${price}${unit}${rate ? ` (${rate})` : ''}.` : '',
    ].filter(Boolean);

    return details.join(' ');
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
    let audio: ReturnType<typeof parseAudioInput> | undefined;

    try {
        audio = parseAudioInput(body.audio);
    } catch (audioError) {
        return NextResponse.json({ error: audioError instanceof Error ? audioError.message : 'Invalid audio recording' }, { status: 400 });
    }

    const userContext = await getPropertyChatUserContext(userId);

    const response = await runPropertyChatTurn({
        messages,
        draft,
        defaultRate,
        audio,
        userContext,
    }).catch(() => null);

    if (!response) {
        return NextResponse.json({
            assistantMessage: AI_AGENT_OCCUPIED_MESSAGE,
            draft,
            missingFields: [],
            readyToCreate: false,
            createPayload: null,
        });
    }
    const responseDefaultRate = getDefaultPropertyPriceRate(response.draft.types || [], response.draft.purposes || []);
    const generatedTitle = String(response.draft.title || '').trim() || buildGeneratedListingTitle(response.draft);
    const generatedRemarks = response.draft.remarks || buildGeneratedRemarks(response.draft);

    const createPayload = response.readyToCreate
        ? {
            title: generatedTitle || 'Property Listing',
            types: Array.isArray(response.draft.types) ? response.draft.types : [],
            purposes: Array.isArray(response.draft.purposes) ? response.draft.purposes : [],
            natures: Array.isArray(response.draft.natures) && response.draft.natures.length > 0
                ? response.draft.natures
                : undefined,
            isPrivate: Boolean(response.draft.isPrivate),
            remarks: generatedRemarks || undefined,
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
