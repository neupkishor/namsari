import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost } from '../actions';
import BlogFormClient from '../BlogFormClient';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let post = null;
    try {
        post = await getBlogPost(Number(id));
    } catch (e) {
        console.error("Failed to fetch blog post", e);
    }

    if (!post) return notFound();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <Link href="/manage/blog" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    ← Back to Blog Management
                </Link>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Edit Post</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Update your blog post content.</p>
            </header>

            <BlogFormClient initialData={post} isEdit={true} />
        </div>
    );
}
