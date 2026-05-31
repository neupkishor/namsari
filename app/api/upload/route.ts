import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getUploaderSecret() {
    return process.env.PRIVATE_KEY || '';
}

function getPhpUploadUrl(request: Request) {
    return new URL('/uploader/upload.php', request.url);
}

export async function POST(request: Request) {
    try {
        const privateKey = getUploaderSecret();
        if (!privateKey) {
            return NextResponse.json({ error: 'Uploader secret is missing' }, { status: 500 });
        }

        const incomingUrl = new URL(request.url);
        const type = incomingUrl.searchParams.get('type') || 'users';
        const fileField = incomingUrl.searchParams.get('file') || 'file';
        const formData = await request.formData();

        const file = formData.get(fileField);
        if (!file) {
            return NextResponse.json({ error: `No file uploaded with field name: ${fileField}` }, { status: 400 });
        }

        const targetUrl = getPhpUploadUrl(request);
        targetUrl.searchParams.set('type', type);
        targetUrl.searchParams.set('file', fileField);

        const forwardForm = new FormData();
        for (const [key, value] of formData.entries()) {
            forwardForm.append(key, value);
        }

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'X-Namsari-Upload-Key': privateKey,
            },
            body: forwardForm,
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const payload = await response.json();
            return NextResponse.json(payload, { status: response.status });
        }

        const text = await response.text();
        return new NextResponse(text, { status: response.status });
    } catch (error) {
        console.error('Error proxying upload:', error);
        return NextResponse.json({ error: 'Failed to proxy upload' }, { status: 500 });
    }
}