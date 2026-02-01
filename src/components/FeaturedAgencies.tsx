import React from 'react';
import Link from 'next/link';

// Mock data for agencies
const agencies = [
    {
        id: 1,
        name: 'Neupane Real Estate',
        username: 'neupane_re',
        logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
        properties: 12,
        verified: true
    },
    {
        id: 2,
        name: 'Kathmandu Housing',
        username: 'ktm_housing',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80',
        properties: 8,
        verified: true
    },
    {
        id: 3,
        name: 'Pokhara Properties',
        username: 'pkr_props',
        logo: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=150&q=80',
        properties: 15,
        verified: false
    },
    {
        id: 4,
        name: 'Urban Estates',
        username: 'urban_estates',
        logo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=150&q=80',
        properties: 5,
        verified: true
    }
];

// --- Classic View Component ---
export const FeaturedAgenciesClassic = () => {
    return (
        <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>
                    Featured Agencies
                </h2>
                <Link href="/agencies" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View All Agencies <span>→</span>
                </Link>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                {agencies.map((agency) => (
                    <div
                        key={agency.id}
                        className="card"
                        style={{
                            padding: '32px 24px',
                            textAlign: 'center',
                            borderRadius: 'var(--radius-card)',
                            border: '1px solid #f1f5f9',
                            background: 'white',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            margin: '0 auto 16px',
                            border: '4px solid #f8fafc'
                        }}>
                            <img src={agency.logo} alt={agency.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            {agency.name}
                            {agency.verified && <span style={{ color: '#3b82f6', fontSize: '1rem' }} title="Verified">✓</span>}
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>@{agency.username}</p>

                        <div style={{
                            background: '#f8fafc',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-inner)',
                            display: 'inline-block',
                            fontSize: '0.85rem',
                            color: '#475569',
                            fontWeight: '600'
                        }}>
                            {agency.properties} Properties Listed
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// --- Social Feed View Component ---
export const FeaturedAgenciesFeed = () => {
    return (
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: 'var(--radius-card)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Recommended Agencies</h3>
                <Link href="/agencies" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none' }}>See All</Link>
            </div>

            <div style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '12px',
                msOverflowStyle: 'none',  /* IE and Edge */
                scrollbarWidth: 'none'  /* Firefox */
            }}>
                <style dangerouslySetInnerHTML={{ __html: `div::-webkit-scrollbar { display: none; }` }} />

                {agencies.map((agency) => (
                    <div
                        key={agency.id}
                        style={{
                            minWidth: '140px',
                            border: '1px solid #f1f5f9',
                            borderRadius: 'var(--radius-inner)',
                            padding: '16px 12px',
                            textAlign: 'center',
                            flexShrink: 0,
                            position: 'relative'
                        }}
                    >
                        {/* Close/Dismiss dummy button for the "friend suggestion" feel */}
                        <button style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'transparent',
                            border: 'none',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            lineHeight: 1
                        }}>×</button>

                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            margin: '0 auto 12px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <img src={agency.logo} alt={agency.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {agency.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '12px' }}>
                            {agency.properties} Properties
                        </div>

                        <button style={{
                            background: '#eff6ff',
                            color: '#3b82f6',
                            border: 'none',
                            borderRadius: 'calc(var(--radius-inner) - 2px)',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            width: '100%',
                            cursor: 'pointer'
                        }}>
                            Follow
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
