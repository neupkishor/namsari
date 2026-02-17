'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

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
            where: { status: 'active' },
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
                link: takes_to || null,
                title: posted_by || "Untitled Ad", // Mapping posted_by to title for legacy compatibility
                position: shows_on_top ? 'banner_top' : 'feed',
                status: 'active',
                userId: parseInt(session.id)
            }
        });

        await logActivity({
            activity_type: 'create_advertisement',
            description: `Created advertisement: ${posted_by || "Untitled Ad"}`,
            account_id: parseInt(session.id),
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

        const newStatus = ad.status === 'active' ? 'paused' : 'active';

        await prisma.advertisement.update({
            where: { id },
            data: { status: newStatus }
        });

        await logActivity({
            activity_type: 'toggle_advertisement_status',
            description: `Changed advertisement status from "${ad.status}" to "${newStatus}"`,
            account_id: parseInt(session.id),
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
        const ad = await prisma.advertisement.findUnique({ where: { id } });
        
        await prisma.advertisement.delete({
            where: { id }
        });

        if (ad) {
            await logActivity({
                activity_type: 'delete_advertisement',
                description: `Deleted advertisement: ${ad.title}`,
                account_id: parseInt(session.id),
            });
        }

        revalidatePath('/manage/advertisements');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete advertisement:", error);
        return { error: "Failed to delete advertisement" };
    }
}
