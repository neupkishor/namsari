'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function updateAboutContent(data: {
    title: string;
    description: string;
    mission: string;
    standard: string;
    group_info: string;
    content: string;
}) {
    const session = await getSession();
    if (!session?.id) throw new Error("Unauthorized");

    const user = await prisma.account.findUnique({
        where: { id: parseInt(session.id) },
        include: { role: true }
    });

    if (!user) throw new Error("Unauthorized");

    if (user.type !== 'admin' && !user.role?.name?.toLowerCase().includes('admin')) {
        throw new Error("Forbidden");
    }

    if (!prisma.aboutContent) {
        throw new Error("AboutContent model not found in Prisma client. Please restart the developer server (npm run dev) to refresh the database schema.");
    }
    console.log('UPDATING ABOUT CONTENT:', data);
    try {
        await prisma.aboutContent.upsert({
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
        const content = await prisma.aboutContent.findFirst({
            where: { id: 1 }
        });
        return content;
    } catch (e) {
        console.error("getAboutContent error:", e);
        return null;
    }
}
