const REMOTE_UPLOAD_URL = 'https://namsari.com/assets/api/resources';
const MAX_UPLOAD_SIZE = 200 * 1024;

function safeFileName(name: string) {
    return name.trim().replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 180) || 'file';
}

export async function uploadFileToAssetServer(file: File) {
    if (file.size > MAX_UPLOAD_SIZE) {
        throw new Error(`${file.name} is larger than 200 KB and was not uploaded.`);
    }

    const token = process.env.TOKEN;
    if (!token) throw new Error('TOKEN is not configured on the server');

    const fileName = safeFileName(file.name);
    const url = new URL(REMOTE_UPLOAD_URL);
    url.searchParams.set('source', 'files');
    url.searchParams.set('path', `/media/${fileName}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': file.type || 'application/octet-stream',
        },
        body: await file.arrayBuffer(),
        cache: 'no-store',
    });

    const text = await response.text();
    let providerResponse: unknown = null;
    try { providerResponse = JSON.parse(text); } catch { providerResponse = text; }

    if (!response.ok) {
        const detail = typeof providerResponse === 'string' ? providerResponse : JSON.stringify(providerResponse);
        throw new Error(`Remote upload failed (${response.status}): ${detail}`);
    }

    const provider = providerResponse && typeof providerResponse === 'object' ? providerResponse as Record<string, any> : {};
    const path = provider.path || provider.file || `/media/${fileName}`;
    const urlFromProvider = provider.url || `https://namsari.com/assets${path.startsWith('/') ? path : `/${path}`}`;

    return { ...provider, id: provider.id || fileName, path, url: urlFromProvider, name: provider.name || fileName, fileName: provider.fileName || provider.name || fileName, size: file.size, mime: file.type, providerResponse };
}
