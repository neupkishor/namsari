import React from 'react';
import Link from 'next/link';
import { getBlogPosts } from './actions';
import BlogListClient from './BlogListClient';

export default async function BlogManagementPage() {
    let posts = [];
    try {
        posts = await getBlogPosts();
    } catch (e) {
        console.error("Failed to fetch blog posts", e);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Blog Posts</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Manage your company blog and news.</p>
                </div>
                <Link href="/manage/blog/create" className="btn-corporate" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>+</span> Create New Post
                </Link>
            </header>

            <BlogListClient initialPosts={posts} />
        </div>
    );
}
