import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createPropertyListing } from '@/lib/services/property';
import { getDefaultPropertyPriceRate } from '@/lib/pricing';

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
