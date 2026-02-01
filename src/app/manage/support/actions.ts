'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
};

export async function getSupportArticles() {
    return await (prisma as any).supportArticle.findMany({
        orderBy: { created_at: 'desc' }
    });
}

export async function getSupportArticle(id: number) {
    return await (prisma as any).supportArticle.findUnique({
        where: { id }
    });
}

export async function createSupportArticle(data: {
    title: string;
    category: string;
    content: string;
    status?: string;
}) {
    const article = await (prisma as any).supportArticle.create({
        data: {
            title: data.title,
            slug: generateSlug(data.title),
            category: data.category,
            content: data.content,
            status: data.status || 'published'
        }
    });
    revalidatePath('/manage/support');
    return article;
}

export async function updateSupportArticle(id: number, data: {
    title: string;
    category: string;
    content: string;
    status: string;
}) {
    const article = await (prisma as any).supportArticle.update({
        where: { id },
        data: {
            title: data.title,
            category: data.category,
            content: data.content,
            status: data.status
        }
    });
    revalidatePath('/manage/support');
    revalidatePath(`/manage/support/${id}`);
    return article;
}

export async function deleteSupportArticle(id: number) {
    await (prisma as any).supportArticle.delete({
        where: { id }
    });
    revalidatePath('/manage/support');
}
