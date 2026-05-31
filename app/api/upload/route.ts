import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createErrorLog } from '@/lib/error-logger';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';

function readEnvValue(key: string) {
    const envPaths = [
        path.join(process.cwd(), '.env'),
        path.join(process.cwd(), 'uploader', '.env')
    ];

    for (const envPath of envPaths) {
        if (!fs.existsSync(envPath)) continue;

        const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith('#')) continue;

            const separatorIndex = line.indexOf('=');
            if (separatorIndex < 0) continue;

            const envKey = line.slice(0, separatorIndex).trim();
            if (envKey !== key) continue;

            return line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
        }
    }

    return '';
}

function getUploaderSecret() {
    return process.env.PRIVATE_KEY || readEnvValue('PRIVATE_KEY');
}

function getSigningSecret() {
    return process.env.UPLOAD_SIGNING_SECRET || getUploaderSecret();
}

function signPayload(payload: string, secret: string) {
    return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string) {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
}

async function getFileSha256(file: File) {
    const buffer = Buffer.from(await file.arrayBuffer());
    return createHash('sha256').update(buffer).digest('hex');
}

function verifyUploadToken(token: FormDataEntryValue | null, secret: string) {
    if (typeof token !== 'string') {
        throw new Error('Upload token is missing');
    }

    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) {
        throw new Error('Upload token is malformed');
    }

    const expectedSignature = signPayload(payload, secret);
    if (!safeEqual(signature, expectedSignature)) {
        throw new Error('Upload token signature is invalid');
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.aud !== 'namsari-upload' || !decoded.exp || decoded.exp < now) {
        throw new Error('Upload token is expired or invalid');
    }

    return decoded;
}

function getConfiguredUploaderUrl() {
    return process.env.NEXT_PUBLIC_UPLOADER_URL || readEnvValue('NEXT_PUBLIC_UPLOADER_URL');
}

function getPublicRequestUrl(request: Request) {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || requestUrl.protocol.replace(':', '');

    if (forwardedHost) {
        requestUrl.host = forwardedHost;
        requestUrl.protocol = `${forwardedProto}:`;
    }

    const isLocalHost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
    const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(requestUrl.hostname);
    const isProductionDomain = requestUrl.protocol === 'https:' && !isLocalHost && !isIpAddress;

    if (isProductionDomain) {
        requestUrl.port = '';
    }

    return requestUrl.toString();
}

function getUploadTargetUrl(request: Request) {
    const configuredUrl = getConfiguredUploaderUrl();

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
        const publicRequestUrl = getPublicRequestUrl(request);
        const privateKey = getUploaderSecret();
        const signingSecret = getSigningSecret();
        if (!privateKey) {
            await createErrorLog({
                message: 'Uploader secret is missing',
                source: 'upload',
                page: publicRequestUrl,
                userId: session?.user?.id ? Number(session.user.id) : null,
                log: {
                    reason: 'missing_private_key',
                    checked: ['process.env.PRIVATE_KEY', '.env PRIVATE_KEY', 'uploader/.env PRIVATE_KEY']
                }
            });
            return NextResponse.json({ error: 'Uploader secret is missing' }, { status: 500 });
        }
        if (!signingSecret) {
            return NextResponse.json({ error: 'Upload signing secret is missing' }, { status: 500 });
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
                page: publicRequestUrl,
                userId: session?.user?.id ? Number(session.user.id) : null,
                log: { type, fileField, reason: 'missing_file' }
            });
            return NextResponse.json({ error: `No file uploaded with field name: ${fileField}` }, { status: 400 });
        }
        if (!(file instanceof File)) {
            return NextResponse.json({ error: `Invalid upload for field name: ${fileField}` }, { status: 400 });
        }

        try {
            const token = verifyUploadToken(formData.get('upload_token'), signingSecret);
            const expectedSignature = formData.get('upload_signature');
            const expectedSize = Number(formData.get('upload_size'));

            if (token.type !== type || token.fileField !== fileField) {
                throw new Error('Upload token does not match this upload endpoint');
            }
            if (token.intent?.size !== file.size || expectedSize !== file.size) {
                throw new Error('Upload size does not match signed intent');
            }
            if (token.intent?.type !== (file.type || 'application/octet-stream')) {
                throw new Error('Upload MIME type does not match signed intent');
            }

            const actualSignature = await getFileSha256(file);
            if (token.intent?.sha256 !== actualSignature || expectedSignature !== actualSignature) {
                throw new Error('Upload signature does not match file contents');
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            await createErrorLog({
                message: err.message,
                source: 'upload',
                page: publicRequestUrl,
                userId: session?.user?.id ? Number(session.user.id) : null,
                log: { type, fileField, reason: 'invalid_upload_signature' }
            });
            return NextResponse.json({ error: err.message }, { status: 403 });
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
                    page: publicRequestUrl,
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
                page: publicRequestUrl,
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
            page: getPublicRequestUrl(request),
            stack: err.stack || null,
            log: { reason: 'proxy_exception' }
        }).catch(() => {});
        return NextResponse.json({ error: 'Failed to proxy upload' }, { status: 500 });
    }
}
