import Link from 'next/link';

export default function SbarNotFound() {
    return (
        <main style={{ minHeight: '100%', background: '#ffffff', paddingBottom: '48px' }}>
            <div className="mx-auto w-full max-w-[1400px] px-0.5 pt-3 sm:px-6 lg:px-8">
                <div
                    className="card"
                    style={{
                        borderRadius: '24px',
                        border: '1px solid #e2e8f0',
                        padding: '56px 32px',
                        textAlign: 'center',
                        background: 'white'
                    }}
                >
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                        Error 404
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', lineHeight: '1.2', marginBottom: '16px' }}>
                        Page Not Found
                    </h1>
                    <p style={{ maxWidth: '620px', margin: '0 auto 28px', color: '#64748b', fontSize: '1.05rem' }}>
                        The page you requested may have been moved or no longer exists.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <Link
                            href="/"
                            style={{
                                background: 'var(--color-primary)',
                                color: 'white',
                                padding: '12px 22px',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontWeight: '700'
                            }}
                        >
                            Go Home
                        </Link>
                        <Link
                            href="/blog"
                            style={{
                                border: '1px solid #e2e8f0',
                                color: 'var(--color-primary)',
                                padding: '12px 22px',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontWeight: '700',
                                background: 'white'
                            }}
                        >
                            Browse Blog
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
