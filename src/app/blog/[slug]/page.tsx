import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getBlogPostBySlug } from '@/app/manage/blog/actions';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch user for header
    const session = await getSession();
    let user = null;
    if (session?.id) {
        user = await prisma.user.findUnique({ where: { id: Number(session.id) } });
    }

    // Fetch blog post
    let post = null;
    try {
        post = await getBlogPostBySlug(slug);
    } catch (e) {
        console.error("Failed to fetch blog post", e);
    }

    if (!post || post.status !== 'published') return notFound();

    return (
        <main style={{ minHeight: '100vh', background: 'white' }}>
            <SiteHeader user={user} />

            <article className="layout-container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '800px' }}>
                <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: '600', marginBottom: '40px' }}>
                    ← Back to Blog
                </Link>

                <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span style={{ color: 'var(--color-gold)' }}>{post.category || 'General'}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-primary)', lineHeight: '1.2', marginBottom: '32px' }}>
                        {post.title}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '700', color: 'white' }}>
                            {post.author ? post.author[0] : 'N'}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                                {post.author || 'Namasari Team'}
                            </div>
                        </div>
                    </div>
                </header>

                {post.cover_image && (
                    <div style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '60px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            style={{ width: '100%', display: 'block' }}
                        />
                    </div>
                )}

                <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    style={{ lineHeight: '1.8', fontSize: '1.15rem', color: '#334155' }}
                />

                <hr style={{ margin: '60px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Share this story</h3>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600' }}>Twitter</button>
                        <button style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600' }}>Facebook</button>
                        <button style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600' }}>LinkedIn</button>
                    </div>
                </div>
            </article>
        </main>
    );
}
