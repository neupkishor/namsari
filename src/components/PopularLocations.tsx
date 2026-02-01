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

export function PopularLocations() {
    const [activeTab, setActiveTab] = useState('House');

    return (
        <section style={{ marginBottom: '40px', width: '100%', marginTop: '40px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' }}>Popular Areas</h2>
            </div>

            {/* Tabs Container */}
            <div style={{ padding: '0 20px', marginBottom: '24px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    background: '#f8fafc',
                    padding: '6px',
                    borderRadius: '16px',
                    width: 'fit-content',
                    margin: '0 auto'
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '8px 20px',
                                background: activeTab === tab ? 'white' : 'transparent',
                                border: 'none',
                                color: activeTab === tab ? '#3b82f6' : '#64748b',
                                fontWeight: activeTab === tab ? '700' : '500',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderRadius: '12px',
                                boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: '20px',
                border: '1px solid #f1f5f9',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px 32px'
                }}>
                    {LOCATIONS[activeTab]?.map((loc, i) => (
                        <Link
                            key={i}
                            href={`/explore?q=${activeTab} in ${loc}`}
                            style={{
                                color: '#475569',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                padding: '4px 0',
                                display: 'block',
                                transition: 'all 0.2s',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.color = '#3b82f6';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.color = '#475569';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            {activeTab} in {loc}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
