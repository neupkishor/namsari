const DEFAULT_UPLOADER_BASE_URL = 'https://namsari.com/uploader/upload.php';

export function getUploaderBaseUrl() {
    return process.env.NEXT_PUBLIC_UPLOADER_URL || DEFAULT_UPLOADER_BASE_URL;
}

export function buildUploaderUrl(type: string, fileField = 'file') {
    const url = new URL(getUploaderBaseUrl());
    url.searchParams.set('type', type);
    url.searchParams.set('file', fileField);
    return url.toString();
}

export function resolveUploadedFileUrl(path?: string, url?: string) {
    if (path) {
        return path.startsWith('http://') || path.startsWith('https://')
            ? path
            : `${new URL(getUploaderBaseUrl()).origin}${path}`;
    }

    return url || '';
}