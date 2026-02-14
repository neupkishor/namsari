'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateAboutContent(data: {
    title: string;
    description: string;
    mission: string;
    standard: string;
    group_info: string;
    content: string;
}) {
    if (!(prisma as any).aboutContent) {
        throw new Error("AboutContent model not found in Prisma client. Please restart the developer server (npm run dev) to refresh the database schema.");
    }
    console.log('UPDATING ABOUT CONTENT:', data);
    try {
        await (prisma as any).aboutContent.upsert({
            where: { id: 1 },
            update: data,
            create: {
                id: 1,
                ...data
            }
        });
        console.log('ABOUT CONTENT UPDATED SUCCESSFULLY');
    } catch (error: any) {
        console.error('ERROR UPDATING ABOUT CONTENT:', error);
        throw new Error(error.message || 'Database update failed');
    }

    revalidatePath('/about');
    revalidatePath('/manage/about');
    return { success: true };
}

export async function getAboutContent() {
    try {
        const content = await (prisma as any).aboutContent.findFirst({
            where: { id: 1 }
        });
        return content;
    } catch (e) {
        console.error("getAboutContent error:", e);
        return null;
    }
}
