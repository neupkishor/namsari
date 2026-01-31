'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateUserProfilePicture(userId: number, url: string) {
    await (prisma as any).user.update({
        where: { id: userId },
        data: { profile_picture: url }
    });
    revalidatePath('/[@username]', 'page');
}
