import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

function toNullableNumber(value: unknown) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function toNullableString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid media payload' }, { status: 400 });
    }

    const url = toNullableString((body as any).url);
    const originalName = toNullableString((body as any).originalName);
    const fileName = toNullableString((body as any).fileName);
    const uploadType = toNullableString((body as any).uploadType) || 'unknown';

    if (!url || !originalName || !fileName) {
        return NextResponse.json({ error: 'url, originalName, and fileName are required' }, { status: 400 });
    }

    const media = await prisma.media.create({
        data: {
            uploaderId: Number(session.user.id),
            url,
            path: toNullableString((body as any).path),
            uploadType,
            originalName,
            fileName,
            mime: toNullableString((body as any).mime),
            originalSize: toNullableNumber((body as any).originalSize),
            compressedSize: toNullableNumber((body as any).compressedSize),
            storedSize: toNullableNumber((body as any).storedSize),
            sha256: toNullableString((body as any).sha256),
            width: toNullableNumber((body as any).width),
            height: toNullableNumber((body as any).height),
            providerResponse: (body as any).providerResponse || undefined,
            folderId: toNullableNumber((body as any).folderId),
        },
    });

    return NextResponse.json({ success: true, media });
}
