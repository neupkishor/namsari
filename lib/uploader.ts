import imageCompression from 'browser-image-compression';

const DEFAULT_UPLOADER_BASE_URL = '/api/uploads';
export const MAX_UPLOAD_SIZE = 200 * 1024;
export function getUploaderBaseUrl() {
    return DEFAULT_UPLOADER_BASE_URL;
}

function getPublicUploadsBaseUrl() {
    const assetsBase = process.env.NEXT_PUBLIC_ASSETS_URL;
    if (assetsBase) {
        return assetsBase.replace(/\/$/, '');
    }

    const uploaderBase = getUploaderBaseUrl();
    if (uploaderBase.startsWith('http://') || uploaderBase.startsWith('https://')) {
        const url = new URL(uploaderBase);
        return `${url.origin}/assets`;
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin.replace(/\/$/, '')}/assets`;
    }

    return '';
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
    if (url) {
        return url;
    }

    if (path) {
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        const publicBaseUrl = getPublicUploadsBaseUrl();
        if (publicBaseUrl) {
            return `${publicBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
        }

        return path;
    }

    return '';
}

export type UploadIntent = {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    sha256: string;
};

async function prepareUploadFile(file: File) {
    if (file.size <= MAX_UPLOAD_SIZE) return file;

    if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is larger than 200 KB and cannot be uploaded.`);
    }

    const compressed = await imageCompression(file, {
        maxSizeMB: MAX_UPLOAD_SIZE / (1024 * 1024),
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        initialQuality: 0.8,
    });

    if (compressed.size > MAX_UPLOAD_SIZE) {
        throw new Error(`${file.name} could not be compressed below 200 KB and was not uploaded.`);
    }

    return new File([compressed], file.name, {
        type: compressed.type || file.type,
        lastModified: file.lastModified,
    });
}

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

async function recordUploadedMedia(uploadType: string, file: File, originalFile: File, intent: UploadIntent, data: any, folderId?: number | null) {
    const path = data?.path || data?.file || '';
    const pathStr = path || '';

    let url = data?.url || '';
    if (!url && pathStr) {
        url = resolveUploadedFileUrl(pathStr);
    }

    if (!url) {
        throw new Error('Unable to determine uploaded file URL');
    }

    const payload = {
        url,
        path: pathStr || null,
        uploadType,
        originalName: originalFile.name,
        fileName: data?.name || pathStr.split('/').filter(Boolean).pop() || file.name,
        mime: data?.mime || file.type || null,
        originalSize: originalFile.size,
        compressedSize: file.size,
        storedSize: typeof data?.size === 'number' ? data.size : file.size,
        sha256: intent.sha256,
        providerResponse: data || null,
    };

    const createMediaRecord = async (nextFolderId: number | null) => {
        const response = await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                ...payload,
                folderId: nextFolderId,
            }),
        });

        const body = await response.json().catch(() => null);
        return { response, body };
    };

    const initialResult = await createMediaRecord(folderId || null);
    if (initialResult.response.ok) {
        return initialResult.body;
    }

    if (folderId !== null && folderId !== undefined && initialResult.response.status === 404) {
        const fallbackResult = await createMediaRecord(null);
        if (fallbackResult.response.ok) {
            return fallbackResult.body;
        }

        throw new Error(fallbackResult.body?.error || fallbackResult.body?.message || `Failed to record media (status ${fallbackResult.response.status})`);
    }

    throw new Error(initialResult.body?.error || initialResult.body?.message || `Failed to record media (status ${initialResult.response.status})`);
}

export async function uploadFileWithIntent(options: UploadWithIntentOptions) {
    const fileField = options.fileField || 'file';
    const originalFile = options.originalFile || options.file;
    const preparedFile = await prepareUploadFile(options.file);
    options.onStatusChange?.('preparing');
    const intent = await createUploadIntent(preparedFile);
    const formData = options.formData || new FormData();
    formData.set(fileField, preparedFile);
    formData.set('fileField', fileField);
    formData.set('type', options.type);
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
                        (async () => {
                            try {
                                await recordUploadedMedia(options.type, preparedFile, originalFile, intent, parsed, options.folderId);
                                resolve(parsed);
                            } catch (err) {
                                reject(err instanceof Error ? err : new Error(String(err)));
                            }
                        })();
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

    await recordUploadedMedia(options.type, preparedFile, originalFile, intent, data, options.folderId);

    return data;
}
