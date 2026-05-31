import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

const TOKEN_TTL_SECONDS = 5 * 60;
const ALLOWED_TYPES = new Set(['users', 'properties', 'ads', 'agencies']);

type UploadIntent = {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    sha256: string;
};

function getSigningSecret() {
    return process.env.UPLOAD_SIGNING_SECRET || process.env.PRIVATE_KEY || '';
}

function base64Url(input: string | Buffer) {
    return Buffer.from(input).toString('base64url');
}

function signPayload(payload: string, secret: string) {
    return createHmac('sha256', secret).update(payload).digest('base64url');
}

function isValidIntent(intent: UploadIntent) {
    return Boolean(
        intent &&
        typeof intent.name === 'string' &&
        Number.isFinite(intent.size) &&
        intent.size > 0 &&
        typeof intent.type === 'string' &&
        Number.isFinite(intent.lastModified) &&
        /^[a-f0-9]{64}$/.test(intent.sha256)
    );
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = getSigningSecret();
    if (!secret) {
        return NextResponse.json({ error: 'Upload signing secret is missing' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    const type = typeof body?.type === 'string' ? body.type : 'users';
    const fileField = typeof body?.fileField === 'string' ? body.fileField : 'file';
    const intent = body?.intent as UploadIntent;

    if (!ALLOWED_TYPES.has(type)) {
        return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(fileField)) {
        return NextResponse.json({ error: 'Invalid file field' }, { status: 400 });
    }

    if (!isValidIntent(intent)) {
        return NextResponse.json({ error: 'Invalid upload intent' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        aud: 'namsari-upload',
        sub: String(session.user.id),
        type,
        fileField,
        intent,
        iat: now,
        exp: now + TOKEN_TTL_SECONDS,
    };
    const encodedPayload = base64Url(JSON.stringify(payload));
    const signature = signPayload(encodedPayload, secret);

    return NextResponse.json({
        token: `${encodedPayload}.${signature}`,
        expiresAt: payload.exp,
    });
}
