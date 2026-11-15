// FileBrowser Quantum uploads through POST /api/resources;
// /api/uploads can be your app's proxy route if needed.

import { randomBytes } from 'node:crypto';

const REMOTE_UPLOAD_URL = 'https://namsari.com/assets/api/resources';
const MAX_UPLOAD_SIZE = 500 * 1024;

// location allowed characters:
// a-z A-Z 0-9 _ - /
const LOCATION_REGEX = /^[A-Za-z0-9_/-]+$/;

function normalizeLocation(location: string) {
    const normalized = location.trim().replace(/^\/+|\/+$/g, '');

    if (!normalized) {
        throw new Error('location is required');
    }

    if (!LOCATION_REGEX.test(normalized)) {
        throw new Error(
            'location can only contain: a-z, A-Z, 0-9, _, -, /'
        );
    }

    return normalized;
}

function decodeProviderPath(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function normalizeMediaPath(value: string) {
    const decoded = decodeProviderPath(value);
    return decoded.replace(/^\/files(?=\/)/, '') || '/';
}

function createUniqueFileName(fileName: string) {
    const trimmed = fileName.trim();

    if (!trimmed) {
        throw new Error('fileName is required');
    }

    // Keep only:
    // a-z A-Z 0-9 - .
    //
    // Everything else becomes "-"
    const normalized = trimmed
        .replace(/[^A-Za-z0-9.-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 160);

    if (!normalized || normalized === '.' || normalized === '..') {
        throw new Error('fileName could not be normalized into a valid filename');
    }

    const extensionStart = normalized.lastIndexOf('.');
    const extension = extensionStart > 0 ? normalized.slice(extensionStart) : '';
    const baseName = extension ? normalized.slice(0, extensionStart) : normalized;
    const suffix = `${Date.now()}-${randomBytes(4).toString('hex')}`;

    return `${baseName}-${suffix}${extension}`;
}

export async function uploadFileToAssetServer(
    file: File,
    location: string,
    fileName: string
) {
    if (!file) {
        throw new Error('file is required');
    }

    if (file.size > MAX_UPLOAD_SIZE) {
        throw new Error(
            `${file.name} is larger than 200 KB and was not uploaded.`
        );
    }

    const token = process.env.TOKEN;

    if (!token) {
        throw new Error('TOKEN is not configured on the server');
    }

    const normalizedLocation = normalizeLocation(location);
    const normalizedFileName = createUniqueFileName(fileName);

    const remotePath =
        `/${normalizedLocation}/${normalizedFileName}`;

    const url = new URL(REMOTE_UPLOAD_URL);

    url.searchParams.set('source', 'files');
    url.searchParams.set('path', remotePath);

    let response: Response;

    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type':
                    file.type || 'application/octet-stream',
            },
            body: await file.arrayBuffer(),
            cache: 'no-store',
        });
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? `Asset server request failed: ${error.message}`
                : 'Asset server request failed'
        );
    }

    const text = await response.text();

    let providerResponse: unknown = null;

    try {
        providerResponse = text
            ? JSON.parse(text)
            : null;
    } catch {
        providerResponse = text;
    }

    if (!response.ok) {
        const detail =
            typeof providerResponse === 'string'
                ? providerResponse
                : JSON.stringify(providerResponse);

        throw new Error(
            `Remote upload failed (${response.status}): ${detail}`
        );
    }

    const provider =
        providerResponse &&
        typeof providerResponse === 'object' &&
        !Array.isArray(providerResponse)
            ? (providerResponse as Record<string, any>)
            : {};

    const providerUrl =
        typeof provider.url === 'string' ? provider.url : null;
    const pathFromProviderUrl = providerUrl
        ? (() => {
              try {
                  const pathname = new URL(providerUrl).pathname;
                  return normalizeMediaPath(pathname.replace(/^\/assets(?=\/)/, '')) || null;
              } catch {
                  return null;
              }
          })()
        : null;

    const path = normalizeMediaPath(
        typeof provider.path === 'string'
            ? provider.path
            : typeof provider.file === 'string'
              ? provider.file
              : pathFromProviderUrl
                ? pathFromProviderUrl
                : remotePath
    );

    const assetUrl =
        typeof provider.url === 'string'
            ? provider.url
            : `https://namsari.com/media${
                  path.startsWith('/')
                      ? path
                      : `/${path}`
              }`;

    return {
        ...provider,

        id:
            provider.id ||
            normalizedFileName,

        location:
            normalizedLocation,

        path,

        url:
            assetUrl,

        name:
            provider.name ||
            normalizedFileName,

        fileName:
            provider.fileName ||
            provider.name ||
            normalizedFileName,

        originalFileName:
            fileName,

        size:
            file.size,

        mime:
            file.type ||
            'application/octet-stream',

        providerResponse,
    };
}
