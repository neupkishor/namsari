'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCollection(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('is_public') === 'on';
    const userId = parseInt(formData.get('user_id') as string);
    const type = (formData.get('type') as string) || 'user_generated';
    const moreInfo = formData.get('moreInfo') as string;

    if (!name || isNaN(userId)) {
        throw new Error("Invalid Input");
    }

    await prisma.collection.create({
        data: {
            name,
            description,
            is_public: isPublic,
            user_id: userId,
            type,
            moreInfo: type === 'system_generated' ? moreInfo : null
        }
    });

    revalidatePath('/manage/collections');
}

export async function deleteCollection(id: number) {
    await prisma.collection.delete({
        where: { id }
    });
    revalidatePath('/manage/collections');
}
