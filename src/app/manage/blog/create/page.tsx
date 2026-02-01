import React from 'react';
import Link from 'next/link';
import BlogFormClient from '../BlogFormClient';

export default function CreateBlogPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <Link href="/manage/blog" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    ← Back to Blog Management
                </Link>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Create New Post</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Write a new blog post for the Namsari news feed.</p>
            </header>

            <BlogFormClient isEdit={false} />
        </div>
    );
}
