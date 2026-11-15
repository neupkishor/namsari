'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
};

function normalizeBlogContent(rawContent: string) {
    const content = (rawContent || '').trim();
    if (!content) return '';

    const hasBlockHtml = /<(p|h[1-6]|ul|ol|li|blockquote|pre|table|div|img|figure|hr|br)\b/i.test(content);
    if (hasBlockHtml) return content;

    return content
        .split(/\n{2,}/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk) => `<p>${chunk.replace(/\n/g, '<br />')}</p>`)
        .join('');
}

async function checkAdmin() {
    const session = await getSession();
    if (!session?.id) return false;

    const user = await prisma.user.findUnique({
        where: { id: parseInt(session.id) },
        include: { role: true }
    });

    if (!user) return false;

    return user.type === 'admin' || user.role?.role?.toLowerCase().includes('admin');
}

export async function getBlogPosts(status?: string) {
    if (!prisma.blogPost) {
        throw new Error("BlogPost model not found. Restart server.");
    }
    const where = status ? { status } : {};
    return await prisma.blogPost.findMany({
        where,
        orderBy: { created_at: 'desc' }
    });
}

export async function getBlogPost(id: number) {
    if (!prisma.blogPost) {
        throw new Error("BlogPost model not found.");
    }
    return await prisma.blogPost.findUnique({
        where: { id }
    });
}

export async function getBlogPostBySlug(slug: string) {
    if (!prisma.blogPost) {
        throw new Error("BlogPost model not found.");
    }
    return await prisma.blogPost.findUnique({
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
    if (!(await checkAdmin())) {
        throw new Error("Unauthorized");
    }

    if (!prisma.blogPost) {
        throw new Error("BlogPost model not found.");
    }
    const post = await prisma.blogPost.create({
        data: {
            title: data.title,
            slug: generateSlug(data.title),
            content: normalizeBlogContent(data.content),
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
    if (!(await checkAdmin())) {
        throw new Error("Unauthorized");
    }

    if (!prisma.blogPost) {
        throw new Error("BlogPost model not found.");
    }
    const post = await prisma.blogPost.update({
        where: { id },
        data: {
            title: data.title,
            content: normalizeBlogContent(data.content),
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
    if (!(await checkAdmin())) {
        throw new Error("Unauthorized");
    }

    if (!prisma.blogPost) {
        throw new Error("BlogPost model not found.");
    }
    await prisma.blogPost.delete({
        where: { id }
    });
    revalidatePath('/manage/blog');
    revalidatePath('/blog');
}
