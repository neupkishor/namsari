import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getBlogPosts } from '@/app/manage/blog/actions';

export default async function BlogPage() {
    const session = await getSession();
    let user = null;
    if (session?.id) {
        user = await prisma.user.findUnique({ where: { id: Number(session.id) } });
    }

    let posts = [];
    try {
        posts = await getBlogPosts('published');
    } catch (e) {
        console.error("Failed to fetch blog posts", e);
    }

    return (
        <main style={{ minHeight: '100vh', background: 'white' }}>
            <SiteHeader user={user} />

            <div className="layout-container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '1100px' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', color: 'var(--color-primary)' }}>
                        Namsari Blog
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                        Insights, market trends, and updates from the future of Nepalese real estate.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '40px' }}>
                    {posts.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '60px' }}>
                            We haven't published any stories yet. Check back soon!
                        </div>
                    ) : (
                        posts.map((post: any) => (
                            <Link
                                href={`/blog/${post.slug}`}
                                key={post.id}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <article className="card blog-card" style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}>
                                    {post.cover_image && (
                                        <div style={{ height: '220px', overflow: 'hidden' }}>
                                            <img
                                                src={post.cover_image}
                                                alt={post.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                                            <span style={{ color: 'var(--color-gold)' }}>{post.category || 'General'}</span>
                                            <span>•</span>
                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', lineHeight: '1.4', marginBottom: '12px' }}>
                                            {post.title}
                                        </h3>
                                        <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '1rem', marginBottom: '24px', flexGrow: 1 }}>
                                            {post.excerpt || 'Read the full story...'}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Optional Author Avatar */}
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>
                                                {post.author ? post.author[0] : 'N'}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>
                                                {post.author || 'Namasari Team'}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))
                    )}
                </div>
            </div>
            <style jsx global>{`
                .blog-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                }
            `}</style>
        </main>
    );
}
