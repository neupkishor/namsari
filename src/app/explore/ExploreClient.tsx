'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Input } from '@/components/ui';
import { SiteHeader } from '@/components/SiteHeader';
import { PropertyCard } from '@/components/PropertyCard';

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '12px' }}></div>
});

export default function ExploreClient({ initialUser, initialQuery = '' }: { initialUser: any, initialQuery?: string }) {
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.324]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [showMap, setShowMap] = useState(false); // For mobile toggle
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

    const fetchProperties = async (loadMore = false) => {
        try {
            if (loadMore) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            const currentSkip = loadMore ? skip : 0;
            let url = `/api/properties?take=20&skip=${currentSkip}`;

            // Add bounds filter if map has been moved/zoomed
            if (mapBounds) {
                url += `&north=${mapBounds.north}&south=${mapBounds.south}&east=${mapBounds.east}&west=${mapBounds.west}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (loadMore) {
                setProperties(prev => [...prev, ...data]);
            } else {
                setProperties(data);
            }

            setHasMore(data.length === 20);
            if (loadMore) {
                setSkip(currentSkip + 20);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
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

    // Refetch when map bounds change
    useEffect(() => {
        if (mapBounds) {
            setSkip(0);
            fetchProperties(false);
        }
    }, [mapBounds]);

    // Infinite scroll handler
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;

        if (bottom && !isLoadingMore && hasMore) {
            fetchProperties(true);
        }
    };

    const handleMapBoundsChange = (bounds: { north: number; south: number; east: number; west: number }) => {
        setMapBounds(bounds);
    };

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

    const handleCardHover = (p: any) => {
        setHoveredId(p.id);
        if (p.latitude && p.longitude) {
            setMapCenter([p.latitude, p.longitude]);
        }
    };

    const handleCardClick = (p: any) => {
        setSelectedId(p.id);
        if (p.latitude && p.longitude) {
            setMapCenter([p.latitude, p.longitude]);
        }
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'white'
        }}>
            {/* Site Header */}
            <SiteHeader user={initialUser} />

            {/* Airbnb-style Search Bar */}
            <div className="explore-header" style={{
                background: 'white',
                borderBottom: '1px solid #EBEBEB',
                padding: '16px 24px',
                position: 'sticky',
                top: 'var(--header-height)',
                zIndex: 40
            }}>
                <div style={{
                    maxWidth: '2520px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    justifyContent: 'space-between'
                }}>
                    <div className="search-wrapper" style={{ flex: 1, maxWidth: '500px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search destinations"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    import('../actions/search').then(mod => mod.recordSearch(searchQuery));
                                }
                            }}
                            className="airbnb-search"
                            style={{
                                width: '100%',
                                padding: '14px 48px 14px 20px',
                                borderRadius: '32px',
                                border: '1px solid #DDDDDD',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'box-shadow 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                            }}
                        />
                        <button style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'var(--color-primary)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </div>

                    <div className="results-count" style={{
                        fontSize: '0.9rem',
                        color: '#717171',
                        whiteSpace: 'nowrap'
                    }}>
                        {filteredProperties.length} properties
                    </div>
                </div>
            </div>

            {/* Mobile Map Toggle Button */}
            <button
                className="mobile-map-toggle"
                onClick={() => setShowMap(!showMap)}
                style={{
                    display: 'none',
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 50,
                    background: '#222222',
                    color: 'white',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '24px',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                }}
            >
                {showMap ? (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                        Show list
                    </>
                ) : (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                            <line x1="8" y1="2" x2="8" y2="18"></line>
                            <line x1="16" y1="6" x2="16" y2="22"></line>
                        </svg>
                        Show map
                    </>
                )}
            </button>

            {/* Airbnb-style Split View */}
            <div className="split-container" style={{
                display: 'flex',
                height: 'calc(100vh - var(--header-height) - 73px)',
                position: 'relative'
            }}>
                {/* Left: Scrollable Property List */}
                <div
                    className={`properties-section ${showMap ? 'mobile-hidden' : ''}`}
                    onScroll={handleScroll}
                    style={{
                        flex: '1',
                        overflowY: 'auto',
                        padding: '24px',
                        background: 'white'
                    }}
                >
                    <div style={{
                        maxWidth: '1280px',
                        margin: '0 auto'
                    }}>
                        <div className="airbnb-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '24px',
                            paddingBottom: '80px'
                        }}>
                            {isLoading ? (
                                Array(12).fill(0).map((_, i) => (
                                    <div key={i} className="skeleton-card" style={{
                                        height: '380px',
                                        borderRadius: '12px',
                                        background: '#F7F7F7'
                                    }}></div>
                                ))
                            ) : filteredProperties.map((p) => (
                                <div
                                    key={p.id}
                                    data-property-id={p.id}
                                    onMouseEnter={() => handleCardHover(p)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => handleCardClick(p)}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        transform: hoveredId === p.id ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <PropertyCard property={p} />
                                </div>
                            ))}
                        </div>

                        {/* Loading More Indicator */}
                        {isLoadingMore && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '40px 0',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    animation: 'bounce 1.4s infinite ease-in-out both'
                                }}></div>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    animation: 'bounce 1.4s infinite ease-in-out both 0.2s'
                                }}></div>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    animation: 'bounce 1.4s infinite ease-in-out both 0.4s'
                                }}></div>
                            </div>
                        )}

                        {/* No More Properties */}
                        {!isLoading && !isLoadingMore && !hasMore && filteredProperties.length > 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 0',
                                color: '#717171',
                                fontSize: '0.9rem'
                            }}>
                                No more properties to load
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Fixed Map */}
                <div className={`map-section ${!showMap ? 'mobile-hidden' : ''}`} style={{
                    width: '50%',
                    height: '100%',
                    position: 'sticky',
                    top: 'calc(var(--header-height) + 73px)',
                    background: '#F7F7F7'
                }}>
                    <MapComponent
                        properties={mapProperties}
                        center={mapCenter}
                        userLocation={userLocation}
                        selectedId={hoveredId || selectedId}
                        onMarkerClick={(id: number) => {
                            setSelectedId(id);
                            const property = properties.find(p => p.id === id);
                            if (property) {
                                // Scroll to property card
                                const element = document.querySelector(`[data-property-id="${id}"]`);
                                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }}
                        onBoundsChange={handleMapBoundsChange}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1);
                    }
                }

                .airbnb-search:hover {
                    box-shadow: 0 2px 4px rgba(0,0,0,0.18) !important;
                }

                .airbnb-search:focus {
                    box-shadow: 0 0 0 2px var(--color-primary) !important;
                }

                /* Desktop: Always show split view */
                @media (min-width: 1025px) {
                    .map-section {
                        display: block !important;
                    }
                    .properties-section {
                        width: 50% !important;
                    }
                    .mobile-map-toggle {
                        display: none !important;
                    }
                }

                /* Tablet (768px - 1024px) */
                @media (min-width: 768px) and (max-width: 1024px) {
                    .map-section {
                        width: 45% !important;
                    }
                    .properties-section {
                        width: 55% !important;
                    }
                    .airbnb-grid {
                        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
                        gap: 20px !important;
                    }
                }

                /* Mobile (≤767px) */
                @media (max-width: 767px) {
                    .explore-header {
                        padding: 12px 16px !important;
                    }

                    .search-wrapper {
                        max-width: 100% !important;
                    }

                    .results-count {
                        display: none;
                    }

                    .split-container {
                        height: calc(100vh - var(--header-height) - 61px) !important;
                    }

                    .properties-section {
                        width: 100% !important;
                        padding: 16px !important;
                    }

                    .map-section {
                        position: fixed !important;
                        width: 100% !important;
                        height: calc(100vh - var(--header-height) - 61px) !important;
                        top: calc(var(--header-height) + 61px) !important;
                        left: 0;
                        z-index: 45;
                    }

                    .mobile-hidden {
                        display: none !important;
                    }

                    .mobile-map-toggle {
                        display: flex !important;
                    }

                    .airbnb-grid {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                        padding-bottom: 100px !important;
                    }
                }

                /* Small mobile (≤480px) */
                @media (max-width: 480px) {
                    .airbnb-search {
                        font-size: 0.9rem !important;
                        padding: 12px 44px 12px 16px !important;
                    }
                }
            `}</style>
        </main>
    );
}
