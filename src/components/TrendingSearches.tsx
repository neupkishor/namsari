import React from 'react';
import Link from 'next/link';

export function TrendingSearches({ searches }: { searches: string[] }) {
    if (!searches || searches.length === 0) {
        return null;
    }

    return (
        <section
            className="card"
            style={{
                width: '100%',
                padding: '32px',
                fontFamily: 'inherit',
                border: '1px solid var(--color-border)'
            }}
        >
            {/* Header Unit */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--color-primary)',
                        marginBottom: '4px',
                        letterSpacing: '-0.02em'
                    }}>
                        Trending Searches
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: '400' }}>
                        Most frequent market queries.
                    </p>
                </div>
            </div>

            {/* Separator */}
            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '28px' }} />

            {/* Tags Grid */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                {searches.map((term, i) => (
                    <Link
                        key={i}
                        href={`/explore?q=${encodeURIComponent(term)}`}
                        style={{
                            color: '#475569',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            padding: '10px 14px',
                            background: '#fcfcfc',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-inner)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '500'
                        }}
                    >
                        <span style={{ color: 'var(--color-gold)', fontSize: '1.2rem', opacity: 0.7 }}>•</span>
                        {term}
                    </Link>
                ))}
            </div>
        </section>
    );
}
