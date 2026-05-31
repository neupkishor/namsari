const DEFAULT_UPLOADER_BASE_URL = '/api/upload';

export function getUploaderBaseUrl() {
    return process.env.NEXT_PUBLIC_UPLOADER_URL || DEFAULT_UPLOADER_BASE_URL;
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