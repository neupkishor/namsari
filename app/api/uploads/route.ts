import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFileToAssetServer } from '@/lib/remote-uploader';

export const runtime = 'nodejs';

function toExpectedString(value: FormDataEntryValue | null) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData: any = await request.formData().catch(() => null);
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
        const saved = await uploadFileToAssetServer(entry);

        return NextResponse.json({
            success: true,
            id: saved.id || saved.name,
            name: saved.fileName || saved.name,
            file: saved.path,
            path: saved.path,
            url: saved.url,
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
