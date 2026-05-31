const DEFAULT_UPLOADER_BASE_URL = '/api/upload';
const UPLOAD_SIGNATURE_ENDPOINT = '/api/upload/sign';

export function getUploaderBaseUrl() {
    const configuredUrl = process.env.NEXT_PUBLIC_UPLOADER_URL || DEFAULT_UPLOADER_BASE_URL;

    if (typeof window !== 'undefined' && configuredUrl.startsWith('http')) {
        const configured = new URL(configuredUrl);
        const currentHost = window.location.hostname;
        const isLocalTesting = currentHost === 'localhost' || currentHost === '127.0.0.1';
        const isSameDomain = configured.hostname === currentHost;

        if (isLocalTesting || isSameDomain) {
            return DEFAULT_UPLOADER_BASE_URL;
        }
    }

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

function buildSignedUploaderUrl(type: string, fileField = 'file') {
    const query = new URLSearchParams({ type, file: fileField }).toString();
    return `${DEFAULT_UPLOADER_BASE_URL}?${query}`;
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
    formData?: FormData;
    fileField?: string;
    onProgress?: (progress: number) => void;
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

async function getUploadToken(uploadType: string, fileField: string, file: File) {
    const intent = await createUploadIntent(file);
    const response = await fetch(UPLOAD_SIGNATURE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: uploadType, fileField, intent }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.token) {
        throw new Error(data.error || data.message || 'Unable to prepare upload');
    }

    return { token: data.token as string, intent };
}

function buildSignedFormData(formData: FormData | undefined, fileField: string, file: File, token: string, intent: UploadIntent) {
    const signedForm = formData || new FormData();
    signedForm.set(fileField, file);
    signedForm.set('platform', String(signedForm.get('platform') || 'namsari'));
    signedForm.set('upload_token', token);
    signedForm.set('upload_signature', intent.sha256);
    signedForm.set('upload_size', String(intent.size));
    signedForm.set('upload_name', intent.name);
    signedForm.set('upload_mime', intent.type);
    signedForm.set('upload_last_modified', String(intent.lastModified));
    return signedForm;
}

export async function uploadFileWithIntent(options: UploadWithIntentOptions) {
    const fileField = options.fileField || 'file';
    const { token, intent } = await getUploadToken(options.type, fileField, options.file);
    const formData = buildSignedFormData(options.formData, fileField, options.file, token, intent);

    if (options.onProgress) {
        return new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', buildSignedUploaderUrl(options.type, fileField));

            xhr.upload.onprogress = (event) => {
                if (!event.lengthComputable) return;
                options.onProgress?.(Math.round((event.loaded / event.total) * 100));
            };

            xhr.onload = () => {
                try {
                    const parsed = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(parsed.message || parsed.error || `Upload failed with status ${xhr.status}`));
                    }
                } catch {
                    reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error(`Upload request failed for ${buildSignedUploaderUrl(options.type, fileField)}`));
            xhr.send(formData);
        });
    }

    const response = await fetch(buildSignedUploaderUrl(options.type, fileField), {
        method: 'POST',
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || data.error || `Upload failed with status ${response.status}`);
    }

    return data;
}
