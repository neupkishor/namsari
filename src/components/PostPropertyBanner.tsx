import React from 'react';
import Link from 'next/link';

export const PostPropertyBanner = () => {
    return (
        <section>
            <div style={{
                background: '#f0f9ff',
                borderRadius: 'var(--radius-card)',
                padding: '40px 60px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '40px',
                position: 'relative',
                overflow: 'hidden',
                flexWrap: 'wrap'
            }}>
                <div style={{ flex: 1, minWidth: '300px', zIndex: 2 }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: '#1e293b',
                        marginBottom: '12px',
                        lineHeight: 1.2
                    }}>
                        Post your property for <span style={{ color: '#22c55e' }}>free</span>
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '32px' }}>
                        List it on Namsari and get genuine leads.
                    </p>
                    <Link href="/sell" style={{ textDecoration: 'none' }}>
                        <button style={{
                            background: '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            padding: '14px 32px',
                            borderRadius: 'var(--radius-inner)',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            // Removed shadow/transform hover
                            transition: 'filter 0.2s',
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.filter = 'brightness(1.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.filter = 'brightness(1)';
                            }}
                        >
                            <span style={{
                                background: 'white',
                                color: '#0ea5e9',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                paddingBottom: '2px'
                            }}>+</span>
                            ADD PROPERTY
                        </button>
                    </Link>
                </div>

                <div style={{ zIndex: 1, display: 'flex', alignItems: 'flex-end' }}>
                    {/* Using a high quality emoji/text composition as placeholder for the illustration in the reference image */}
                    <div style={{
                        fontSize: '10rem',
                        lineHeight: 1,
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))',
                        transform: 'rotate(-5deg)'
                    }}>
                        🏡
                    </div>
                </div>

                {/* Decorative background elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0
                }} />
            </div>
        </section>
    );
};
