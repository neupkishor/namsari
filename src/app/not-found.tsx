'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            fontFamily: 'var(--font-outfit), sans-serif',
            padding: '24px'
        }}>
            <div style={{
                maxWidth: '1000px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '60px',
                flexWrap: 'wrap-reverse'
            }}>
                {/* Text Content */}
                <div style={{ flex: 1, minWidth: '320px' }}>
                    <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: 'var(--color-gold)',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '16px'
                    }}>
                        Error 404
                    </div>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        lineHeight: '1.2',
                        color: 'var(--color-primary)',
                        marginBottom: '24px'
                    }}>
                        You seem lost,<br />let us help you find your home.
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#64748b',
                        marginBottom: '40px',
                        lineHeight: '1.6'
                    }}>
                        The page you are looking for might have been moved, renamed, or is temporarily unavailable.
                        Experience the standard of premium real estate navigation instead.
                    </p>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link
                            href="/"
                            style={{
                                background: 'var(--color-primary)',
                                color: 'white',
                                padding: '16px 32px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: '700',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 23, 42, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(15, 23, 42, 0.1)';
                            }}
                        >
                            Return Home
                        </Link>
                        <Link
                            href="/explore"
                            style={{
                                border: '2px solid #e2e8f0',
                                color: 'var(--color-primary)',
                                padding: '16px 32px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: '700',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            Explore Map
                        </Link>
                    </div>
                </div>

                {/* Visual Element */}
                <div style={{
                    flex: 1,
                    minWidth: '320px',
                    position: 'relative',
                    height: '500px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                }}>
                    <img
                        src="/images/not_found_mansion.png"
                        alt="Minimalist Mansion"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onError={(e) => {
                            // Fallback in case image processing takes a second
                            e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000";
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(15,23,42,0.4), transparent)',
                        pointerEvents: 'none'
                    }}></div>
                </div>
            </div>
        </main>
    );
}
