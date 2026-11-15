'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { deleteAssetByRelativePath } from '@/lib/assets';
import { getSession } from '@/lib/auth';

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

export async function deleteMedia(mediaId: number) {
    await requireAdmin();
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media?.path) throw new Error('Media not found');

    await deleteAssetByRelativePath(media.path);

    await prisma.media.delete({ where: { id: mediaId } });
    revalidatePath('/manage/files');
}
