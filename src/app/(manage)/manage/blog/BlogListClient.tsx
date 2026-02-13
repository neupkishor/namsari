'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { deleteBlogPost, updateBlogPost } from './actions';
import { useRouter } from 'next/navigation';

export default function BlogListClient({ initialPosts }: { initialPosts: any[] }) {
    const router = useRouter();
    const [posts, setPosts] = useState(initialPosts);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this post?')) {
            await deleteBlogPost(id);
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    const handleStatusToggle = async (post: any) => {
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        await updateBlogPost(post.id, { ...post, status: newStatus });
        // Optimistic update
        setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
        router.refresh();
    };

    if (!posts || posts.length === 0) {
        return (
            <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No blog posts yet</h3>
                <p>Create your first post to start sharing updates.</p>
            </div>
        );
    }

    return (
        <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>TITLE</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>AUTHOR</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>STATUS</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>UPDATED</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '16px 24px' }}>
                                <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{post.title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>/{post.slug}</div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                                <span style={{ padding: '4px 10px', background: '#f8fafc', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--color-border)' }}>
                                    {post.author || 'Unknown'}
                                </span>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                                <button
                                    onClick={() => handleStatusToggle(post)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        background: post.status === 'published' ? '#dcfce7' : '#f1f5f9',
                                        color: post.status === 'published' ? '#166534' : '#64748b'
                                    }}
                                >
                                    {post.status.toUpperCase()}
                                </button>
                            </td>
                            <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                {new Date(post.updated_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <Link href={`/manage/blog/${post.id}`} style={{ padding: '8px', color: 'var(--color-primary)', cursor: 'pointer' }}>
                                        ✏️
                                    </Link>
                                    <button onClick={() => handleDelete(post.id)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
