'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const TABS = ['House', 'Land', 'Apartment', 'Office Space', 'Flats', 'Shop Space'];

const LOCATIONS: Record<string, string[]> = {
    'House': ['Tikathali', 'Imadol', 'Shital Height', 'Budhanilkantha', 'Lubhu', 'Chunikhel', 'Bhaisepati', 'Sanagaun', 'Ochu Height', 'Balkot', 'Megha City', 'Bhangal', 'Grande Hospital', 'Gothatar', 'Makalbari'],
    'Land': ['Bhaisepati', 'Imadol', 'Budhanilkantha', 'Tikathali', 'Pepsicola', 'Dhapasi', 'Tokha', 'Godawari', 'Thecho', 'Chapagaun', 'Bhaisepati', 'Sitapaila'],
    'Apartment': ['Bhaisepati', 'Lazimpat', 'Baluwatar', 'Panipokhari', 'Jhamsikhel', 'Hattiban', 'Dhapakhel', 'Bakhundole'],
    'Office Space': ['New Baneshwor', 'Putalisadak', 'Thapathali', 'Lazimpat', 'Naxal', 'Kamaladi', 'Tripureshwor'],
    'Flats': ['Koteshwor', 'Baneshwor', 'Lalitpur', 'Bhaktapur', 'Patan', 'Jorpati'],
    'Shop Space': ['New Road', 'Asan', 'Durbar Marg', 'Thamel', 'Lazimpat', 'Jhamsikhel']
};

export function TrendingSearches() {
    const [activeTab, setActiveTab] = useState('House');

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
                        The most frequent market queries for {activeTab.toLowerCase()} seekers.
                    </p>
                </div>

                {/* Tactical Tab Selectors */}
                <div style={{
                    display: 'flex',
                    background: '#f8fafc',
                    padding: '4px',
                    borderRadius: 'var(--radius-card)',
                    border: '1px solid var(--color-border)'
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '8px 16px',
                                background: activeTab === tab ? 'white' : 'transparent',
                                border: 'none',
                                color: activeTab === tab ? 'var(--color-primary)' : '#64748b',
                                fontWeight: activeTab === tab ? '700' : '500',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                borderRadius: 'var(--radius-inner)',
                                boxShadow: activeTab === tab ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Separator */}
            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '28px' }} />

            {/* Location Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '12px 24px'
            }}>
                {LOCATIONS[activeTab]?.map((loc, i) => (
                    <Link
                        key={i}
                        href={`/explore?q=${activeTab} in ${loc}`}
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
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontWeight: '500'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.color = 'var(--color-gold)';
                            e.currentTarget.style.borderColor = 'var(--color-gold)';
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.color = '#475569';
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            e.currentTarget.style.background = '#fcfcfc';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <span style={{ color: 'var(--color-gold)', fontSize: '1.2rem', opacity: 0.7 }}>•</span>
                        {loc}
                    </Link>
                ))}
            </div>
        </section>
    );
}
