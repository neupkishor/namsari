import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readdir, rm, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_ASSETS_ROOT = '../assets';

function sanitizeBaseName(value: string) {
    const normalized = value
        .trim()
        .replace(/[^A-Za-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

    return (normalized || 'file').slice(0, 100);
}

function sanitizeExtension(value: string) {
    return value.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}

export function getAssetsRoot() {
    return path.resolve(process.cwd(), process.env.UPLOADS_ROOT || DEFAULT_ASSETS_ROOT);
}

export function getAssetsBaseUrl(origin?: string) {
    const configured = process.env.NEXT_PUBLIC_ASSETS_URL?.trim();
    if (configured) {
        return configured.replace(/\/$/, '');
    }

    if (origin) {
        return `${origin.replace(/\/$/, '')}/assets`;
    }

    return '/assets';
}

export function buildAssetUrl(relativePath: string, origin?: string) {
    return `${getAssetsBaseUrl(origin)}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
}

export async function saveUploadedAsset(file: File, metadata?: { expectedName?: string; expectedSize?: number; expectedSha256?: string; }) {
    if (metadata?.expectedName && metadata.expectedName !== file.name) {
        throw new Error('Upload name does not match request metadata');
    }

    if (typeof metadata?.expectedSize === 'number' && metadata.expectedSize !== file.size) {
        throw new Error('Upload size does not match request metadata');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sha256 = createHash('sha256').update(buffer).digest('hex');

    if (metadata?.expectedSha256 && metadata.expectedSha256 !== sha256) {
        throw new Error('Upload signature does not match file contents');
    }

    const parsed = path.parse(file.name || 'file');
    const id = randomBytes(8).toString('hex');
    const baseName = sanitizeBaseName(parsed.name || 'file');
    const extension = sanitizeExtension(parsed.ext.replace(/^\./, ''));
    const fileName = `${baseName}${extension ? `.${extension}` : ''}`;
    const relativePath = `/${id}/${fileName}`;
    const absoluteDir = path.join(/* turbopackIgnore: true */ getAssetsRoot(), id);
    const absolutePath = path.join(/* turbopackIgnore: true */ absoluteDir, fileName);

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absolutePath, buffer);

    return {
        id,
        fileName,
        mime: file.type || 'application/octet-stream',
        path: relativePath,
        size: file.size,
        sha256,
    };
}

export async function deleteAssetByRelativePath(relativePath: string) {
    const normalized = `/${relativePath}`.replace(/\/+/g, '/');
    if (normalized.includes('\0') || normalized.includes('..')) {
        throw new Error('Invalid asset path');
    }

    const assetsRoot = getAssetsRoot();
    const absolutePath = path.resolve(/* turbopackIgnore: true */ assetsRoot, `.${normalized}`);
    const relativeFromRoot = path.relative(assetsRoot, absolutePath);
    if (relativeFromRoot.startsWith('..') || path.isAbsolute(relativeFromRoot)) {
        throw new Error('Invalid asset path');
    }

    try {
        await unlink(absolutePath);
    } catch (error: any) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
    }

    const parentDir = path.dirname(absolutePath);
    if (parentDir !== assetsRoot) {
        try {
            const entries = await readdir(parentDir);
            if (entries.length === 0) {
                await rm(parentDir, { recursive: true, force: true });
            }
        } catch (error: any) {
            if (error?.code !== 'ENOENT') {
                throw error;
            }
        }
    }
}
