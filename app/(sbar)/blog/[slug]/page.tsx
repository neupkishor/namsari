import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/actions/blog';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let post: any = null;
    try {
        post = await getBlogPostBySlug(slug);
    } catch (e) {
        console.error("Failed to fetch blog post", e);
    }

    if (!post || post.status !== 'published') return notFound();

    return (
        <main style={{ minHeight: '100%', background: 'white' }}>
            <article className="mx-auto w-full max-w-[800px] px-0.5 pt-3 sm:px-6 lg:px-8" style={{ paddingBottom: '100px' }}>
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
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary-light)' }}>
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
                    className="blog-article"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    style={{
                        lineHeight: '1.8',
                        fontSize: '1.05rem',
                        color: '#334155',
                        overflowWrap: 'normal',
                        wordBreak: 'normal'
                    }}
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

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .blog-article h1,
                    .blog-article h2,
                    .blog-article h3,
                    .blog-article h4,
                    .blog-article h5,
                    .blog-article h6 {
                        color: var(--color-primary);
                        font-weight: 800;
                        line-height: 1.3;
                        margin-top: 2rem;
                        margin-bottom: 0.8rem;
                        overflow-wrap: normal;
                        word-break: normal;
                    }
                    .blog-article h1 { font-size: 2.1rem; }
                    .blog-article h2 { font-size: 1.75rem; }
                    .blog-article h3 { font-size: 1.45rem; }
                    .blog-article h4 { font-size: 1.2rem; }
                    .blog-article h5 { font-size: 1.05rem; }
                    .blog-article h6 { font-size: 1rem; }

                    .blog-article p,
                    .blog-article li,
                    .blog-article blockquote,
                    .blog-article td,
                    .blog-article th {
                        font-size: 1.05rem;
                        line-height: 1.85;
                        overflow-wrap: normal;
                        word-break: normal;
                    }

                    .blog-article p,
                    .blog-article ul,
                    .blog-article ol,
                    .blog-article blockquote,
                    .blog-article table {
                        margin-bottom: 1.1rem;
                    }

                    .blog-article ul,
                    .blog-article ol {
                        padding-left: 1.4rem;
                    }

                    .blog-article a {
                        color: var(--color-primary);
                        text-decoration: underline;
                        text-underline-offset: 2px;
                        overflow-wrap: anywhere;
                        word-break: break-word;
                    }

                    .blog-article img,
                    .blog-article iframe,
                    .blog-article video,
                    .blog-article table {
                        max-width: 100%;
                        height: auto;
                    }

                    .blog-article pre,
                    .blog-article code {
                        white-space: pre-wrap;
                        word-break: break-word;
                    }
                `
                }} />
            </article>
        </main>
    );
}
