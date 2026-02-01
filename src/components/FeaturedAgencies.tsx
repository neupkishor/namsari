import React from 'react';
import Link from 'next/link';
import { AgencyCard } from './AgencyCard';

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
                    <AgencyCard key={agency.id} agency={agency} variant="classic" />
                ))}
            </div>
        </section>
    );
};

// --- Social Feed View Component ---
export const FeaturedAgenciesFeed = () => {
    return (
        <div className="card" style={{
            padding: '24px',
            background: 'white'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary)' }}>Recommended Agencies</h3>
                <Link href="/agencies" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>See All</Link>
            </div>

            <div style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '8px',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }}>
                <style dangerouslySetInnerHTML={{ __html: `div::-webkit-scrollbar { display: none; }` }} />

                {agencies.map((agency) => (
                    <AgencyCard key={agency.id} agency={agency} variant="feed" />
                ))}
            </div>
        </div>
    );
};

