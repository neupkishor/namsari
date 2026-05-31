'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

function sanitizeSegment(value: string) {
    return value
        .trim()
        .replace(/[^A-Za-z0-9._-]/g, '-')
        .replace(/^[.-]+|[.-]+$/g, '')
        .slice(0, 100) || 'folder';
}

function getPublicUrl(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path.startsWith('/') ? path : `/${path}`;
}

async function requireAdmin() {
    const session = await getSession();
    if (!session?.id) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({
        where: { id: Number(session.id) },
        include: { role: true },
    });

    const isAdmin = user?.type === 'admin' || user?.role?.role?.toLowerCase().includes('admin');
    if (!user || !isAdmin || session.operatingId) {
        throw new Error('Unauthorized');
    }

    return user;
}

function getFileManagerUrl() {
    const configured = process.env.NEXT_PUBLIC_UPLOADER_URL || '';
    if (configured.startsWith('http://') || configured.startsWith('https://')) {
        return configured.replace(/\/upload\.php(?:\?.*)?$/, '/file-manager.php');
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://127.0.0.1:6267';
    return `${baseUrl.replace(/\/$/, '')}/uploader/file-manager.php`;
}

async function callFileManager(fields: Record<string, string>) {
    const privateKey = process.env.PRIVATE_KEY || '';
    if (!privateKey) throw new Error('PRIVATE_KEY is missing');

    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth')?.value || '';
    if (!authCookie) throw new Error('Auth cookie is missing');

    const formData = new FormData();
    Object.entries({ ...fields, key: privateKey }).forEach(([key, value]) => {
        formData.set(key, value);
    });

    const response = await fetch(getFileManagerUrl(), {
        method: 'POST',
        headers: {
            Cookie: `auth=${authCookie}`,
        },
        body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success === false) {
        throw new Error(data?.error || data?.message || `File operation failed with status ${response.status}`);
    }

    return data;
}

export async function createMediaFolder(formData: FormData) {
    const user = await requireAdmin();
    const name = String(formData.get('name') || '').trim();
    const parentIdValue = formData.get('parentId');
    const parentId = parentIdValue ? Number(parentIdValue) : null;
    if (!name) throw new Error('Folder name is required');

    const slug = sanitizeSegment(name);
    const parent = parentId
        ? await prisma.mediaFolder.findUnique({ where: { id: parentId } })
        : null;

    if (parentId && !parent) throw new Error('Parent folder not found');

    await prisma.mediaFolder.create({
        data: {
            name,
            slug,
            fullPath: parent ? `${parent.fullPath}/${slug}` : `files/${slug}`,
            parentId,
            createdById: user.id,
        },
    });

    revalidatePath('/manage/files');
}

export async function renameMedia(mediaId: number, newName: string) {
    await requireAdmin();
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media?.path) throw new Error('Media not found');

    const sanitizedName = sanitizeSegment(newName);
    const result = await callFileManager({
        action: 'rename',
        file: media.path,
        new_name: sanitizedName,
    });

    const newPath = String(result.new_file || '');
    const newFileName = newPath.split('/').filter(Boolean).pop() || sanitizedName;
    await prisma.media.update({
        where: { id: mediaId },
        data: {
            path: newPath,
            url: getPublicUrl(newPath),
            fileName: newFileName,
        },
    });

    revalidatePath('/manage/files');
}

export async function moveMedia(mediaId: number, folderId: number | null) {
    await requireAdmin();
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media?.path) throw new Error('Media not found');

    const folder = folderId ? await prisma.mediaFolder.findUnique({ where: { id: folderId } }) : null;
    if (folderId && !folder) throw new Error('Folder not found');

    const destination = folder?.fullPath || 'files';
    const result = await callFileManager({
        action: 'move',
        file: media.path,
        destination,
    });

    const newPath = String(result.new_file || '');
    await prisma.media.update({
        where: { id: mediaId },
        data: {
            folderId,
            path: newPath,
            url: getPublicUrl(newPath),
        },
    });

    revalidatePath('/manage/files');
}

export async function deleteMedia(mediaId: number) {
    await requireAdmin();
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media?.path) throw new Error('Media not found');

    await callFileManager({
        action: 'delete',
        file: media.path,
    });

    await prisma.media.delete({ where: { id: mediaId } });
    revalidatePath('/manage/files');
}

export async function deleteMediaFolder(folderId: number) {
    await requireAdmin();
    const folder = await prisma.mediaFolder.findUnique({ where: { id: folderId } });
    if (!folder?.fullPath) throw new Error('Folder not found');

    // Ask the file manager to delete the folder. The PHP side only deletes empty folders.
    await callFileManager({
        action: 'delete_folder',
        file: folder.fullPath,
    });

    await prisma.mediaFolder.delete({ where: { id: folderId } });
    revalidatePath('/manage/files');
}
