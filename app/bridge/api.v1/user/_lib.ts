import { createHmac, timingSafeEqual } from 'node:crypto';
import { legacyPricingFromPrice } from '@/lib/pricing';

export const propertyInclude = {
    listedBy: true,
    location: true,
    openHouse: true,
    images: true,
    types: true,
    natures: true,
    features: true,
    property_likes: true,
} as const;

export function parseUserId(value: string) {
    if (!/^\d+$/.test(value)) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function jsonError(message: string, status: number) {
    return Response.json({ success: false, error: message }, { status });
}

export function serializeProperty(property: any) {
    const pricing = legacyPricingFromPrice(property.price);
    const latitude = property.location?.latitude ?? property.openHouse?.latitude ?? null;
    const longitude = property.location?.longitude ?? property.openHouse?.longitude ?? null;

    return {
        ...property,
        pricing,
        location_text: property.location
            ? [property.location.area, property.location.cityVillage, property.location.district]
                .filter(Boolean)
                .join(', ')
            : 'Unspecified',
        latitude,
        longitude,
        images: property.images.map((image: { url: string }) => image.url),
        property_types: property.types.map((type: { name: string }) => type.name),
        property_natures: property.natures.map((nature: { name: string }) => nature.name),
        likes_count: property.property_likes.length,
        author_username: property.listedBy?.username ?? null,
        author_name: property.listedBy?.name ?? null,
        author_avatar: property.listedBy?.profile_picture ?? property.listedBy?.image ?? null,
    };
}

export function authenticatedUserId(request: Request) {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) return null;

    const token = authorization.slice(7).trim();
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) return null;

    const expected = createHmac('sha256', secret)
        .update(`${parts[0]}.${parts[1]}`)
        .digest();

    let received: Buffer;
    try {
        received = Buffer.from(parts[2], 'base64url');
    } catch {
        return null;
    }
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

    try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
            sub?: string;
            exp?: number;
            iss?: string;
        };
        if (payload.iss !== 'namsari-api' || !payload.sub || !payload.exp) return null;
        if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
        return parseUserId(payload.sub);
    } catch {
        return null;
    }
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
    try {
        const body: unknown = await request.json();
        return body !== null && typeof body === 'object' && !Array.isArray(body)
            ? body as Record<string, unknown> : null;
    } catch { return null; }
}
