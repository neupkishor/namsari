'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Input } from '@/components/ui';
import { SiteHeader } from '@/components/SiteHeader';

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '12px' }}></div>
});

export default function ExploreClient({ initialUser, initialQuery = '' }: { initialUser: any, initialQuery?: string }) {
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.324]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    const fetchProperties = async () => {
        try {
            const res = await fetch('/api/properties?take=50');
            const data = await res.json();
            setProperties(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(loc);
                    setMapCenter(loc);
                },
                (err) => console.warn("User denied location access or error:", err)
            );
        }
    }, []);

    const filteredProperties = properties.filter(p => {
        const query = searchQuery.toLowerCase();
        return (p.title?.toLowerCase().includes(query) ||
            p.location?.toLowerCase().includes(query) ||
            p.price?.toString().toLowerCase().includes(query));
    });

    const mapProperties = filteredProperties.filter(p => {
        const lat = p.latitude;
        const lng = p.longitude;
        return lat !== null && lat !== undefined && lat !== '' &&
            lng !== null && lng !== undefined && lng !== '';
    });

    const handleCardClick = (p: any) => {
        setSelectedId(p.id);
        if (p.latitude && p.longitude) {
            setMapCenter([p.latitude, p.longitude]);
        }
        if (viewMode === 'list') {
            setViewMode('map');
        }
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8fafc',
            transition: 'background 0.3s ease'
        }}>
            {/* Site Header */}
            <SiteHeader user={initialUser} fullWidth={viewMode === 'map'} />

            {/* Search Bar Sub-header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                padding: '16px 0',
                position: 'sticky',
                top: 'var(--header-height)',
                zIndex: 40,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                <div className={viewMode === 'map' ? "" : "layout-container"} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    padding: viewMode === 'map' ? '0 40px' : '0 24px',
                    maxWidth: viewMode === 'map' ? 'none' : 'var(--container-max)',
                    margin: '0 auto',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Find estates, commercial assets, or luxury rentals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                borderRadius: 'var(--radius-inner)',
                                border: '1px solid var(--color-border)',
                                background: '#f8fafc',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-card)' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-inner)',
                                border: 'none',
                                background: viewMode === 'list' ? 'white' : 'transparent',
                                color: viewMode === 'list' ? 'var(--color-primary)' : '#64748b',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            Grid View
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-inner)',
                                border: 'none',
                                background: viewMode === 'map' ? 'white' : 'transparent',
                                color: viewMode === 'map' ? 'var(--color-primary)' : '#64748b',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: viewMode === 'map' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                            Map View
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    display: 'flex',
                    height: '100%',
                    width: '200%', // For sliding animation
                    transform: viewMode === 'list' ? 'translateX(0)' : 'translateX(-50%)',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {/* List View Pane */}
                    <div style={{ width: '50%', height: '100%', overflowY: 'auto', padding: '40px 0' }}>
                        <div className="layout-container">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>
                                {filteredProperties.length} Premium Assets Found
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                                {isLoading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <div key={i} className="card skeleton-card" style={{ height: '380px' }}></div>
                                    ))
                                ) : filteredProperties.map((p) => (
                                    <div
                                        key={p.id}
                                        className="card"
                                        style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
                                        onClick={() => handleCardClick(p)}
                                    >
                                        <div style={{ height: '200px', background: '#f1f5f9' }}>
                                            <img src={p.images?.[0] || 'https://via.placeholder.com/400x200'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ color: 'var(--color-gold)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '8px' }}>{p.price}</div>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</h3>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{p.location}</p>
                                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{p.property_types?.[0] || 'Property'}</span>
                                                <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>View on Map →</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map View Pane */}
                    <div style={{ width: '50%', height: 'calc(100vh - var(--header-height) - 81px)', display: 'flex' }}>
                        {/* Map Sidebar */}
                        <aside style={{ width: '400px', flexShrink: 0, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: 'white' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)' }}>Registry Map</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Select an asset to view location details.</p>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                                {filteredProperties.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedId(p.id)}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '12px',
                                            marginBottom: '12px',
                                            cursor: 'pointer',
                                            border: '2px solid',
                                            borderColor: selectedId === p.id ? 'var(--color-gold)' : '#f1f5f9',
                                            background: selectedId === p.id ? '#fffbeb' : 'white',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={p.images?.[0] || 'https://via.placeholder.com/150'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-gold)' }}>{p.price}</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.location}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        {/* Interactive Map */}
                        <div style={{ flex: 1, background: '#f8fafc', position: 'relative' }}>
                            <MapComponent
                                properties={mapProperties}
                                center={mapCenter}
                                userLocation={userLocation}
                                selectedId={selectedId}
                                onMarkerClick={(id: number) => setSelectedId(id)}
                            />

                            {/* Floating Map Actions */}
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    position: 'absolute',
                                    bottom: '24px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    zIndex: 1000,
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '30px',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                Back to Gallery
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
