import { createHmac } from 'node:crypto';
import prisma from '@/lib/prisma';

export const publicUserSelect = {
    id: true,
    name: true,
    username: true,
    email: true,
    contact_number: true,
    image: true,
    profile_picture: true,
    type: true,
} as const;

function encodeJwtPart(value: object) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function createApiToken(user: {
    id: number;
    email: string | null;
    type: string;
}) {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error('AUTH_SECRET is not configured');

    const issuedAt = Math.floor(Date.now() / 1000);
    const header = encodeJwtPart({ alg: 'HS256', typ: 'JWT' });
    const payload = encodeJwtPart({
        sub: user.id.toString(),
        email: user.email,
        type: user.type,
        iat: issuedAt,
        exp: issuedAt + 60 * 60 * 24 * 30,
        iss: 'namsari-api',
    });
    const signature = createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64url');

    return `${header}.${payload}.${signature}`;
}

export function successResponse(method: 'signup' | 'signin', user: {
    id: number;
    name: string | null;
    username: string | null;
    email: string | null;
    contact_number: string | null;
    image: string | null;
    profile_picture: string | null;
    type: string;
}, status = 200) {
    return Response.json({
        status: 'success',
        method,
        token: createApiToken(user),
        profile: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.contact_number,
            image: user.image || user.profile_picture,
        },
    }, { status });
}

export function jsonError(message: string, status: number) {
    return Response.json({ success: false, error: message }, { status });
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
    try {
        const body: unknown = await request.json();
        return body !== null && typeof body === 'object' && !Array.isArray(body)
            ? body as Record<string, unknown>
            : null;
    } catch {
        return null;
    }
}

export async function createAvailableUsername(name: string) {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24).padEnd(3, 'x');

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const username = attempt === 0
            ? base
            : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
        const exists = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (!exists) return username;
    }

    return `${base}${Date.now().toString(36)}`;
}
