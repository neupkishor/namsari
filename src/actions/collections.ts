'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCollection(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('is_public') === 'on';
    const userId = parseInt(formData.get('user_id') as string);
    const type = (formData.get('type') as string) || 'user_generated';
    const viewMode = (formData.get('view_mode') as string) || 'classic';
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
            view_mode: viewMode,
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

export async function removePropertyFromCollection(collectionId: number, propertyId: number) {
    if (!collectionId || !propertyId) return;

    await prisma.collectionProperty.deleteMany({
        where: {
            collection_id: collectionId,
            property_id: propertyId
        }
    });

    revalidatePath('/manage/collections');
    revalidatePath(`/manage/collections/[slug]`, 'page'); // We don't know the slug here easily unless passed, but revalidating the path by pattern or specific path handles it. 
    // Ideally we revalidate the specific path, but for now we can just let Next.js handle it on refresh or if we pass the slug.
    // Let's passed slug too for better revalidation
}

export async function removePropertyFromCollectionWithSlug(collectionId: number, propertyId: number, slug: string) {
    if (!collectionId || !propertyId) return;

    await prisma.collectionProperty.deleteMany({
        where: {
            collection_id: collectionId,
            property_id: propertyId
        }
    });

    revalidatePath(`/manage/collections/${slug}`);
}
