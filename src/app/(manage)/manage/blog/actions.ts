'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
};

export async function getBlogPosts(status?: string) {
    if (!(prisma as any).blogPost) {
        throw new Error("BlogPost model not found. Restart server.");
    }
    const where = status ? { status } : {};
    return await (prisma as any).blogPost.findMany({
        where,
        orderBy: { created_at: 'desc' }
    });
}

export async function getBlogPost(id: number) {
    if (!(prisma as any).blogPost) {
        throw new Error("BlogPost model not found.");
    }
    return await (prisma as any).blogPost.findUnique({
        where: { id }
    });
}

export async function getBlogPostBySlug(slug: string) {
    if (!(prisma as any).blogPost) {
        throw new Error("BlogPost model not found.");
    }
    return await (prisma as any).blogPost.findUnique({
        where: { slug }
    });
}

export async function createBlogPost(data: {
    title: string;
    content: string;
    excerpt?: string;
    cover_image?: string;
    category?: string;
    author?: string;
    status?: string;
}) {
    if (!(prisma as any).blogPost) {
        throw new Error("BlogPost model not found.");
    }
    const post = await (prisma as any).blogPost.create({
        data: {
            title: data.title,
            slug: generateSlug(data.title),
            content: data.content,
            excerpt: data.excerpt,
            cover_image: data.cover_image,
            category: data.category || 'General',
            author: data.author || 'Namasari Team',
            status: data.status || 'draft'
        }
    });
    revalidatePath('/manage/blog');
    revalidatePath('/blog');
    return post;
}

export async function updateBlogPost(id: number, data: {
    title: string;
    content: string;
    excerpt?: string;
    cover_image?: string;
    category?: string;
    author?: string;
    status: string;
}) {
    if (!(prisma as any).blogPost) {
        throw new Error("BlogPost model not found.");
    }
    const post = await (prisma as any).blogPost.update({
        where: { id },
        data: {
            title: data.title,
            content: data.content,
            excerpt: data.excerpt,
            cover_image: data.cover_image,
            category: data.category,
            author: data.author,
            status: data.status
        }
    });
    revalidatePath('/manage/blog');
    revalidatePath('/blog');
    revalidatePath(`/manage/blog/${id}`);
    revalidatePath(`/blog/${post.slug}`);
    return post;
}

export async function deleteBlogPost(id: number) {
    if (!(prisma as any).blogPost) {
        throw new Error("BlogPost model not found.");
    }
    await (prisma as any).blogPost.delete({
        where: { id }
    });
    revalidatePath('/manage/blog');
    revalidatePath('/blog');
}
