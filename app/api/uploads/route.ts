import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadFileToAssetServer } from '@/lib/remote-uploader';
import { authenticatedUserId } from '@/app/bridge/api.v1/user/_lib';

export const runtime = 'nodejs';

function toExpectedString(value: FormDataEntryValue | null) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : authenticatedUserId(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let uploadType = toExpectedString(request.headers.get('x-upload-type')) || 'unknown';
    let entry: File | null = null;

    if (contentType.toLowerCase().includes('multipart/form-data')) {
        const formData: any = await request.formData().catch(() => null);
        if (!formData) return NextResponse.json({ error: 'Invalid upload payload' }, { status: 400 });
        const fileField = toExpectedString(formData.get('fileField')) || 'file';
        uploadType = toExpectedString(formData.get('type')) || uploadType;
        entry = formData.get(fileField);
    } else if (request.body) {
        const fileName = request.headers.get('x-file-name') || `upload-${Date.now()}.jpg`;
        entry = new File([await request.arrayBuffer()], fileName, { type: contentType || 'application/octet-stream' });
    }

    if (!(entry instanceof File)) {
        return NextResponse.json({ error: `No file uploaded with field name: ${fileField}` }, { status: 400 });
    }

    try {
        const saved = await uploadFileToAssetServer(entry, uploadType, entry.name);

        const media = await prisma.media.create({
            data: {
                uploaderId: userId,
                path: saved.path,
                uploadFor: uploadType,
                originalName: entry.name,
            },
        });

        if (uploadType === 'users') {
            await prisma.user.update({
                where: { id: userId },
                data: { image: saved.url, profile_picture: saved.url },
            });
        }

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
            media,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        const status = message.startsWith('Upload ') ? 403 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
