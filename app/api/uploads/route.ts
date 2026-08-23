import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { buildAssetUrl, saveUploadedAsset } from '@/lib/assets';

export const runtime = 'nodejs';

function toExpectedString(value: FormDataEntryValue | null) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function toExpectedNumber(value: FormDataEntryValue | null) {
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
        return NextResponse.json({ error: 'Invalid upload payload' }, { status: 400 });
    }

    const fileField = toExpectedString(formData.get('fileField')) || 'file';
    const uploadType = toExpectedString(formData.get('type')) || 'unknown';
    const entry = formData.get(fileField);

    if (!(entry instanceof File)) {
        return NextResponse.json({ error: `No file uploaded with field name: ${fileField}` }, { status: 400 });
    }

    try {
        const saved = await saveUploadedAsset(entry, {
            expectedName: toExpectedString(formData.get('upload_name')),
            expectedSize: toExpectedNumber(formData.get('upload_size')),
            expectedSha256: toExpectedString(formData.get('upload_signature')),
        });

        return NextResponse.json({
            success: true,
            id: saved.id,
            name: saved.fileName,
            file: saved.path,
            path: saved.path,
            url: buildAssetUrl(saved.path, new URL(request.url).origin),
            size: saved.size,
            mime: saved.mime,
            uploadType,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        const status = message.startsWith('Upload ') ? 403 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
