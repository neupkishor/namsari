const DEFAULT_UPLOADER_BASE_URL = '/uploader/upload.php';
const AUTH_COOKIE_SYNC_ENDPOINT = '/api/auth/php-cookie';
export function getUploaderBaseUrl() {
    const configuredUrl = process.env.NEXT_PUBLIC_UPLOADER_URL || DEFAULT_UPLOADER_BASE_URL;
    return configuredUrl;
}

export function buildUploaderUrl(type: string, fileField = 'file') {
    const baseUrl = getUploaderBaseUrl();
    const query = new URLSearchParams({ type, file: fileField }).toString();

    if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
        const url = new URL(baseUrl);
        url.searchParams.set('type', type);
        url.searchParams.set('file', fileField);
        return url.toString();
    }

    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${query}`;
}

export function resolveUploadedFileUrl(path?: string, url?: string) {
    if (path) {
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        if (typeof window !== 'undefined' && window.location?.origin) {
            return `${window.location.origin}${path}`;
        }

        return path;
    }

    return url || '';
}

export type UploadIntent = {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    sha256: string;
};

type UploadWithIntentOptions = {
    type: string;
    file: File;
    originalFile?: File;
    folderId?: number | null;
    folderPath?: string | null;
    formData?: FormData;
    fileField?: string;
    onProgress?: (progress: number) => void;
    onStatusChange?: (status: 'preparing' | 'uploading') => void;
};

function arrayBufferToHex(buffer: ArrayBuffer) {
    return Array.from(new Uint8Array(buffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

export async function createUploadIntent(file: File): Promise<UploadIntent> {
    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());

    return {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        lastModified: file.lastModified || 0,
        sha256: arrayBufferToHex(digest),
    };
}

export async function ensurePhpAuthCookie() {
    const response = await fetch(AUTH_COOKIE_SYNC_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Unauthorized');
    }
}

async function recordUploadedMedia(uploadType: string, file: File, originalFile: File, intent: UploadIntent, data: any, folderId?: number | null) {
    const path = data?.path || data?.file || '';
    const url = resolveUploadedFileUrl(path, data?.url);
    if (!url) return null;

    const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            url,
            path: path || null,
            uploadType,
            originalName: originalFile.name,
            fileName: data?.name || path.split('/').filter(Boolean).pop() || file.name,
            mime: data?.mime || file.type || null,
            originalSize: originalFile.size,
            compressedSize: file.size,
            storedSize: typeof data?.size === 'number' ? data.size : file.size,
            sha256: intent.sha256,
            providerResponse: data || null,
            folderId: folderId || null,
        }),
    });

    return response.ok ? response.json().catch(() => null) : null;
}

export async function uploadFileWithIntent(options: UploadWithIntentOptions) {
    const fileField = options.fileField || 'file';
    const originalFile = options.originalFile || options.file;
    options.onStatusChange?.('preparing');
    await ensurePhpAuthCookie();
    const intent = await createUploadIntent(options.file);
    const formData = options.formData || new FormData();
    formData.set(fileField, options.file);
    formData.set('platform', String(formData.get('platform') || 'namsari'));
    if (options.folderPath) {
        formData.set('folder', options.folderPath);
    }
    formData.set('upload_signature', intent.sha256);
    formData.set('upload_size', String(intent.size));
    formData.set('upload_name', intent.name);
    formData.set('upload_mime', intent.type);
    formData.set('upload_last_modified', String(intent.lastModified));
    options.onStatusChange?.('uploading');

    if (options.onProgress) {
        return new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', buildUploaderUrl(options.type, fileField));
            xhr.withCredentials = true;

            xhr.upload.onprogress = (event) => {
                if (!event.lengthComputable) return;
                options.onProgress?.(Math.round((event.loaded / event.total) * 100));
            };

            xhr.onload = () => {
                try {
                    const parsed = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        recordUploadedMedia(options.type, options.file, originalFile, intent, parsed, options.folderId)
                            .finally(() => resolve(parsed));
                    } else {
                        reject(new Error(parsed.message || parsed.error || `Upload failed with status ${xhr.status}`));
                    }
                } catch {
                    reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error(`Upload request failed for ${buildUploaderUrl(options.type, fileField)}`));
            xhr.send(formData);
        });
    }

    const response = await fetch(buildUploaderUrl(options.type, fileField), {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || data.error || `Upload failed with status ${response.status}`);
    }

    await recordUploadedMedia(options.type, options.file, originalFile, intent, data, options.folderId);

    return data;
}
