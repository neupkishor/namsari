'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function getAdvertisements() {
    try {
        const ads = await prisma.advertisement.findMany({
            orderBy: { created_at: 'desc' }
        });
        return ads;
    } catch (error) {
        console.error("Failed to fetch advertisements:", error);
        return [];
    }
}

export async function getActiveAdvertisements() {
    try {
        const ads = await prisma.advertisement.findMany({
            where: { is_active: true },
            orderBy: { created_at: 'desc' }
        });
        return ads;
    } catch (error) {
        console.error("Failed to fetch active advertisements:", error);
        return [];
    }
}

export async function createAdvertisement(formData: FormData) {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
        return { error: "Unauthorized" };
    }

    const image = formData.get('image') as string;
    const takes_to = formData.get('takes_to') as string;
    const posted_by = formData.get('posted_by') as string;
    const shows_on_top = formData.get('shows_on_top') === 'true';

    if (!image) {
        return { error: "Missing required image" };
    }

    try {
        await prisma.advertisement.create({
            data: {
                image,
                takes_to: takes_to || null,
                posted_by: posted_by || null,
                shows_on_top,
                is_active: true
            }
        });

        revalidatePath('/manage/advertisements');
        revalidatePath('/'); // Update home page
        return { success: true };
    } catch (error) {
        console.error("Failed to create advertisement:", error);
        return { error: "Failed to create advertisement" };
    }
}

export async function toggleAdvertisementStatus(id: number) {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
        return { error: "Unauthorized" };
    }

    try {
        const ad = await prisma.advertisement.findUnique({ where: { id } });
        if (!ad) return { error: "Advertisement not found" };

        await prisma.advertisement.update({
            where: { id },
            data: { is_active: !ad.is_active }
        });

        revalidatePath('/manage/advertisements');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle status:", error);
        return { error: "Failed to update status" };
    }
}

export async function deleteAdvertisement(id: number) {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.advertisement.delete({
            where: { id }
        });

        revalidatePath('/manage/advertisements');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete advertisement:", error);
        return { error: "Failed to delete advertisement" };
    }
}
