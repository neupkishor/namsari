import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createErrorLog } from '@/lib/error-logger';

export const runtime = 'nodejs';

function getUploaderSecret() {
    return process.env.PRIVATE_KEY || '';
}

function getUploadTargetUrl(request: Request) {
    const configuredUrl = process.env.NEXT_PUBLIC_UPLOADER_URL || '';

    if (configuredUrl.startsWith('http://') || configuredUrl.startsWith('https://')) {
        const requestUrl = new URL(request.url);
        const targetUrl = new URL(configuredUrl);

        if (targetUrl.origin !== requestUrl.origin) {
            return targetUrl;
        }
    }

    return new URL('/uploader/upload.php', request.url);
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        const privateKey = getUploaderSecret();
        if (!privateKey) {
            await createErrorLog({
                message: 'Uploader secret is missing',
                source: 'upload',
                page: request.url,
                userId: session?.user?.id ? Number(session.user.id) : null,
                log: { reason: 'missing_private_key' }
            });
            return NextResponse.json({ error: 'Uploader secret is missing' }, { status: 500 });
        }

        const incomingUrl = new URL(request.url);
        const type = incomingUrl.searchParams.get('type') || 'users';
        const fileField = incomingUrl.searchParams.get('file') || 'file';
        const formData = await request.formData();

        const file = formData.get(fileField);
        if (!file) {
            await createErrorLog({
                message: `No file uploaded with field name: ${fileField}`,
                source: 'upload',
                page: request.url,
                userId: session?.user?.id ? Number(session.user.id) : null,
                log: { type, fileField, reason: 'missing_file' }
            });
            return NextResponse.json({ error: `No file uploaded with field name: ${fileField}` }, { status: 400 });
        }

        const targetUrl = getUploadTargetUrl(request);
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
            if (!response.ok || payload?.success === false) {
                await createErrorLog({
                    message: payload?.message || payload?.error || `Upload failed with status ${response.status}`,
                    source: 'upload',
                    page: request.url,
                    userId: session?.user?.id ? Number(session.user.id) : null,
                    log: {
                        type,
                        fileField,
                        status: response.status,
                        target: targetUrl.origin,
                        payload
                    }
                });
            }
            return NextResponse.json(payload, { status: response.status });
        }

        const text = await response.text();
        if (!response.ok) {
            await createErrorLog({
                message: `Upload failed with status ${response.status}`,
                source: 'upload',
                page: request.url,
                userId: session?.user?.id ? Number(session.user.id) : null,
                log: {
                    type,
                    fileField,
                    status: response.status,
                    target: targetUrl.origin,
                    response: text.slice(0, 4000)
                }
            });
        }
        return new NextResponse(text, { status: response.status });
    } catch (error) {
        console.error('Error proxying upload:', error);
        const err = error instanceof Error ? error : new Error(String(error));
        await createErrorLog({
            message: err.message || 'Failed to proxy upload',
            source: 'upload',
            page: request.url,
            stack: err.stack || null,
            log: { reason: 'proxy_exception' }
        }).catch(() => {});
        return NextResponse.json({ error: 'Failed to proxy upload' }, { status: 500 });
    }
}
