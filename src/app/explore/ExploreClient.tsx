'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Input } from '@/components/ui';

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '12px' }}></div>
});

export default function ExploreClient({ initialUser }: { initialUser: any }) {
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.324]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    const fetchProperties = async () => {
        try {
            const res = await fetch('/api/properties');
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

        // Detect user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(loc);
                    // Center map on user if they are the first result or if we want to show their area immediately
                    setMapCenter(loc);
                },
                (err) => console.warn("User denied location access or error:", err)
            );
        }
    }, []);

    const filteredProperties = properties.filter(p => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        return lat && lng && !isNaN(lat) && !isNaN(lng) &&
            (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.location.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const handleCardClick = (p: any) => {
        setSelectedId(p.id);
        if (p.latitude && p.longitude) {
            setMapCenter([p.latitude, p.longitude]);
        }
    };

    return (
        <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
            {/* Search Header */}
            <header className="full-width-header" style={{ flexShrink: 0, background: 'white', borderBottom: '1px solid #ddd', zIndex: 100 }}>
                <div className="layout-container header-content" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', textDecoration: 'none' }}>
                        Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                    </Link>

                    <div style={{ flex: 1, maxWidth: '600px', paddingTop: '16px' }}>
                        <Input
                            type="text"
                            placeholder="Search properties, locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <Link href="/" style={{ color: 'var(--color-text-muted)', fontWeight: '600', textDecoration: 'none' }}>Home</Link>
                        <Link href="/sell" style={{ background: 'var(--color-primary)', color: 'white', padding: '8px 18px', borderRadius: '20px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>List Property</Link>
                    </nav>
                </div>
            </header>

            {/* Main Explore Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Sidebar: Results List */}
                <aside style={{ width: '400px', flexShrink: 0, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: 'white' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{filteredProperties.length} Properties found</h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Discover the perfect estate in our interactive map view.</p>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '12px', marginBottom: '16px' }}></div>
                            ))
                        ) : filteredProperties.length > 0 ? (
                            filteredProperties.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => handleCardClick(p)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        marginBottom: '16px',
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: selectedId === p.id ? 'var(--color-gold)' : '#e2e8f0',
                                        background: selectedId === p.id ? '#fffbeb' : 'white',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ width: '120px', height: '100px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={p.images?.[0] || 'https://via.placeholder.com/150'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.price}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '600' }}>{p.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{p.location}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-gold)', textTransform: 'uppercase', fontWeight: '800', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{p.main_category}</span>
                                            <Link href={`/properties/${p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>View Details</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                <p>No properties found matching your search.</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Large Map View */}
                <div style={{ flex: 1, background: '#f8fafc', position: 'relative' }}>
                    <MapComponent
                        properties={filteredProperties}
                        center={mapCenter}
                        userLocation={userLocation}
                        selectedId={selectedId}
                        onMarkerClick={(id) => setSelectedId(id)}
                    />
                </div>

            </div>
        </main>
    );
}
