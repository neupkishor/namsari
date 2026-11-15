'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
};

export async function getSupportArticles(status?: string) {
    if (!prisma.supportArticle) {
        throw new Error("SupportArticle model not found in Prisma client. Please restart your developer server (npm run dev) to refresh the schema.");
    }
    const where = status ? { status } : {};
    return await prisma.supportArticle.findMany({
        where,
        orderBy: { created_at: 'desc' }
    });
}

export async function getSupportArticle(id: number) {
    if (!prisma.supportArticle) {
        throw new Error("SupportArticle model not found in Prisma client.");
    }
    return await prisma.supportArticle.findUnique({
        where: { id }
    });
}

export async function getSupportArticleBySlug(slug: string) {
    if (!prisma.supportArticle) {
        throw new Error("SupportArticle model not found in Prisma client.");
    }
    return await prisma.supportArticle.findUnique({
        where: { slug }
    });
}

export async function createSupportArticle(data: {
    title: string;
    category: string;
    content: string;
    emoji?: string;
    status?: string;
}) {
    if (!prisma.supportArticle) {
        throw new Error("SupportArticle model not found in Prisma client.");
    }
    const article = await prisma.supportArticle.create({
        data: {
            title: data.title,
            slug: generateSlug(data.title),
            category: data.category,
            content: data.content,
            emoji: data.emoji || '📄',
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
    emoji?: string;
    status: string;
}) {
    if (!prisma.supportArticle) {
        throw new Error("SupportArticle model not found in Prisma client.");
    }
    const article = await prisma.supportArticle.update({
        where: { id },
        data: {
            title: data.title,
            category: data.category,
            content: data.content,
            emoji: data.emoji,
            status: data.status
        }
    });
    revalidatePath('/manage/support');
    revalidatePath(`/manage/support/${id}`);
    return article;
}

export async function deleteSupportArticle(id: number) {
    if (!prisma.supportArticle) {
        throw new Error("SupportArticle model not found in Prisma client.");
    }
    await prisma.supportArticle.delete({
        where: { id }
    });
    revalidatePath('/manage/support');
}
