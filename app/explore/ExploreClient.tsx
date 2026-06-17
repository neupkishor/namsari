'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Header } from '@/components/menu/Header';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { PropertyPost } from '@/components/cards/PropertyFeedCard';

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-surface animate-pulse rounded-3xl"></div>
});

const AANA_TO_SQM = 31.796;

function toNumberOrNull(value: string | null): number | null {
    if (value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeAreaToSqm(area: number | null | undefined, unit?: string): number | null {
    if (area === null || area === undefined || Number.isNaN(Number(area))) return null;

    const numericArea = Number(area);
    const normalizedUnit = (unit || '').toLowerCase().trim();

    if (!normalizedUnit || normalizedUnit === 'm2' || normalizedUnit === 'm²' || normalizedUnit.includes('meter')) {
        return numericArea;
    }

    if (normalizedUnit.includes('sqft') || normalizedUnit.includes('sq.ft')) {
        return numericArea / 10.7639;
    }

    if (normalizedUnit.includes('aana')) {
        return numericArea * AANA_TO_SQM;
    }

    return numericArea;
}

function convertRawAreaPriceParamsToModified(rawUnit: string, rawMinPrice: number | null, rawMaxPrice: number | null) {
    const normalizedUnit = rawUnit.toLowerCase().trim();

    if (normalizedUnit === 'peraana' || normalizedUnit === 'perana' || normalizedUnit === 'per_aana') {
        return {
            modifiedUnit: 'persqm',
            modifiedMinPrice: rawMinPrice === null ? null : rawMinPrice / AANA_TO_SQM,
            modifiedMaxPrice: rawMaxPrice === null ? null : rawMaxPrice / AANA_TO_SQM,
        };
    }

    return {
        modifiedUnit: 'persqm',
        modifiedMinPrice: rawMinPrice,
        modifiedMaxPrice: rawMaxPrice,
    };
}

export default function ExploreClient({ initialUser, initialQuery = '', initialType }: { initialUser: any, initialQuery?: string, initialType?: 'feed' | 'map' }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([27.7172, 85.324]);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [showMap, setShowMap] = useState(false); // For mobile toggle in map mode
    const [searchHoldFeedback, setSearchHoldFeedback] = useState(false);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

    const rawQueryParam = (searchParams.get('rawQuery') || searchParams.get('q') || '').trim();
    const rawTypeParam = (searchParams.get('type') || '').toLowerCase().trim();
    const rawLegacyViewParam = (searchParams.get('view') || '').toLowerCase().trim();
    const resolvedType = rawTypeParam || (rawLegacyViewParam === 'map' ? 'map' : rawLegacyViewParam === 'list' ? 'feed' : initialType || 'feed');
    const isMapMode = resolvedType === 'map';

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

    useEffect(() => {
        setShowMap(isMapMode);
    }, [isMapMode]);

    useEffect(() => {
        setSearchQuery(rawQueryParam);
    }, [rawQueryParam]);

    useEffect(() => {
        const handleHoldFeedback = (event: Event) => {
            const customEvent = event as CustomEvent<{ active?: boolean }>;
            setSearchHoldFeedback(Boolean(customEvent.detail?.active));
        };

        window.addEventListener('explore-view-hold-feedback', handleHoldFeedback as EventListener);
        return () => {
            window.removeEventListener('explore-view-hold-feedback', handleHoldFeedback as EventListener);
        };
    }, []);

    useEffect(() => {
        document.cookie = `explore_view=${isMapMode ? 'map' : 'feed'}; path=/; max-age=31536000; samesite=lax`;
    }, [isMapMode]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        const currentType = (params.get('type') || '').toLowerCase().trim();
        let changed = false;

        if (params.has('view')) {
            const mappedType = params.get('view') === 'map' ? 'map' : 'feed';
            params.delete('view');
            if (!params.get('type')) {
                params.set('type', mappedType);
            }
            changed = true;
        }

        if (currentType && currentType !== 'map' && currentType !== 'feed') {
            params.delete('type');
            changed = true;
        }

        if (changed) {
            const nextUrl = `${pathname}?${params.toString()}`;
            router.replace(nextUrl, { scroll: false });
        }
    }, [pathname, router, searchParams]);

    const applyRawQueryToUrl = () => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        const trimmedQuery = searchQuery.trim();

        if (trimmedQuery) {
            params.set('rawQuery', trimmedQuery);
            import('@/actions/search').then(mod => mod.recordSearch(trimmedQuery)).catch(() => null);
        } else {
            params.delete('rawQuery');
        }

        params.delete('q');

        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
    };

    // Refetch when map bounds change
    useEffect(() => {
        if (isMapMode && mapBounds) {
            setSkip(0);
            fetchProperties(false);
        }
    }, [isMapMode, mapBounds]);

    const toggleMobileMapView = () => {
        const nextShowMap = !showMap;
        setShowMap(nextShowMap);

        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('type', nextShowMap ? 'map' : 'feed');
        params.delete('view');

        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
    };

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

    const selectedLocations = (searchParams.get('locations') || '')
        .split(',')
        .map((location) => location.trim())
        .filter(Boolean);

    const listedByFilter = (searchParams.get('listedBy') || '').toLowerCase().trim();

    const rawUnitParam = (searchParams.get('rawUnit') || '').toLowerCase().trim();
    const rawMinPrice = toNumberOrNull(searchParams.get('rawMinPrice'));
    const rawMaxPrice = toNumberOrNull(searchParams.get('rawMaxPrice'));
    const modifiedUnitParam = (searchParams.get('modifiedUnit') || '').toLowerCase().trim();
    const explicitModifiedMinPrice = toNumberOrNull(searchParams.get('modifiedMinPrice'));
    const explicitModifiedMaxPrice = toNumberOrNull(searchParams.get('modifiedMaxPrice'));

    const derivedModified = convertRawAreaPriceParamsToModified(rawUnitParam, rawMinPrice, rawMaxPrice);

    const effectiveModifiedUnit = modifiedUnitParam || derivedModified.modifiedUnit;
    const effectiveModifiedMinPrice = explicitModifiedMinPrice ?? derivedModified.modifiedMinPrice;
    const effectiveModifiedMaxPrice = explicitModifiedMaxPrice ?? derivedModified.modifiedMaxPrice;
    const hasAreaPriceFilter = effectiveModifiedMinPrice !== null || effectiveModifiedMaxPrice !== null;

    const sizeMinParam = searchParams.get('sizeMin');
    const sizeMaxParam = searchParams.get('sizeMax');
    const sizeUnitParam = (searchParams.get('sizeUnit') || '').toLowerCase();

    const sizeMin = sizeMinParam !== null && sizeMinParam !== '' ? Number(sizeMinParam) : null;
    const sizeMax = sizeMaxParam !== null && sizeMaxParam !== '' ? Number(sizeMaxParam) : null;

    const normalizeArea = (area: number | null | undefined, unit?: string) => {
        if (area === null || area === undefined || Number.isNaN(Number(area))) return null;

        const numericArea = Number(area);
        const normalizedUnit = (unit || '').toLowerCase();

        if (sizeUnitParam === 'sqft') {
            if (normalizedUnit.includes('m')) {
                return numericArea * 10.7639;
            }
            return numericArea;
        }

        if (sizeUnitParam === 'm2' || sizeUnitParam === 'm²' || !sizeUnitParam) {
            if (normalizedUnit.includes('sqft')) {
                return numericArea / 10.7639;
            }
            return numericArea;
        }

        return numericArea;
    };

    const getLocationLabel = (property: any) => {
        if (!property.location) return '';
        if (typeof property.location === 'string') return property.location;

        return [property.location.area, property.location.cityVillage, property.location.city, property.location.district]
            .filter(Boolean)
            .join(', ');
    };

    const filteredProperties = properties.filter(p => {
        const query = searchQuery.toLowerCase();
        const locationLabel = getLocationLabel(p).toLowerCase();
        const propertyPrice = Number(p.pricing?.price || p.price || NaN);
        const propertyAreaSqm = normalizeAreaToSqm(p.features?.builtUpArea, p.features?.builtUpAreaUnit);
        const propertyPerSqmPrice = Number.isFinite(propertyPrice) && propertyAreaSqm && propertyAreaSqm > 0
            ? propertyPrice / propertyAreaSqm
            : null;
        const propertyArea = normalizeArea(p.features?.builtUpArea, p.features?.builtUpAreaUnit);
        const sellerType = (p.listedBy?.type || '').toLowerCase();

        const matchesQuery = (p.title?.toLowerCase().includes(query) ||
            p.location?.toLowerCase().includes(query) ||
            p.price?.toString().toLowerCase().includes(query) ||
            p.property_types?.some((t: string) => t.toLowerCase().includes(query)));

        const matchesLocation = selectedLocations.length === 0 || selectedLocations.some((location) => locationLabel.includes(location.toLowerCase()));

        const matchesListedBy = !listedByFilter || sellerType === listedByFilter;

        const matchesPrice = !hasAreaPriceFilter || (
            effectiveModifiedUnit === 'persqm' &&
            propertyPerSqmPrice !== null &&
            (effectiveModifiedMinPrice === null || propertyPerSqmPrice >= effectiveModifiedMinPrice) &&
            (effectiveModifiedMaxPrice === null || propertyPerSqmPrice <= effectiveModifiedMaxPrice)
        );

        const matchesSize = (sizeMin === null || propertyArea === null || propertyArea >= sizeMin) &&
            (sizeMax === null || propertyArea === null || propertyArea <= sizeMax);

        return matchesQuery && matchesLocation && matchesListedBy && matchesPrice && matchesSize;
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
        <main className="min-h-screen flex flex-col bg-white">
            {/* Site Header */}
            <Header user={initialUser} />

            {/* Airbnb-style Search Bar */}
            <div className="bg-white border-b border-border px-4 sm:px-6 py-4 sticky top-[var(--header-height)] z-40">
                <div className="max-w-[2520px] mx-auto flex items-center gap-4 justify-between">
                    <div className={`relative flex-1 max-w-[500px] group transition-all duration-300 ${
                        searchHoldFeedback ? 'lg:ring-0 ring-2 ring-blue-500 ring-offset-2 ring-offset-white rounded-full' : ''
                    }`}>
                        <input
                            type="text"
                            placeholder="Search destinations"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    applyRawQueryToUrl();
                                }
                            }}
                            className="w-full pl-6 pr-12 py-3.5 rounded-full border border-border text-[15px] font-medium outline-none transition-all duration-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <button title="Search properties" aria-label="Search properties" onClick={applyRawQueryToUrl} className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-transform active:scale-90 hover:bg-primary-light shadow-lg shadow-primary/20">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </div>

                    <div className="hidden sm:block text-[13px] font-black text-text-muted uppercase tracking-widest opacity-60">
                        {filteredProperties.length} properties discovered
                    </div>
                </div>
            </div>

            {isMapMode && (
                <button
                    className="lg:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-text-main text-white px-8 py-4 rounded-full font-black text-[13px] uppercase tracking-widest cursor-pointer flex items-center gap-3 shadow-2xl transition-all active:scale-95 border border-white/10"
                    onClick={toggleMobileMapView}
                >
                    {showMap ? (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                            Show list
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                                <line x1="8" y1="2" x2="8" y2="18"></line>
                                <line x1="16" y1="6" x2="16" y2="22"></line>
                            </svg>
                            Show map
                        </>
                    )}
                </button>
            )}

            {isMapMode ? (
                <div className="flex flex-1 relative h-[calc(100vh-var(--header-height)-81px)]">
                {/* Left: Scrollable Property List */}
                <div
                    className={`flex-1 lg:w-1/2 overflow-y-auto custom-scrollbar p-6 lg:p-8 bg-white ${showMap ? 'hidden lg:block' : 'block'}`}
                    onScroll={handleScroll}
                >
                    <div className="max-w-[1280px] mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-8 pb-32">
                            {isLoading ? (
                                Array(12).fill(0).map((_, i) => (
                                    <div key={i} className="h-[450px] rounded-[2rem] bg-surface animate-pulse"></div>
                                ))
                            ) : filteredProperties.map((p) => (
                                <div
                                    key={p.id}
                                    data-property-id={p.id}
                                    onMouseEnter={() => handleCardHover(p)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => handleCardClick(p)}
                                    className="transition-transform duration-500 hover:scale-[1.02] cursor-pointer h-full"
                                >
                                    <PropertyCard property={p} />
                                </div>
                            ))}
                        </div>

                        {/* Loading More Indicator */}
                        {isLoadingMore && (
                            <div className="flex justify-center py-12 gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                            </div>
                        )}

                        {/* No More Properties */}
                        {!isLoading && !isLoadingMore && !hasMore && filteredProperties.length > 0 && (
                            <div className="text-center py-16 border-t border-border/60">
                                <div className="inline-block p-4 rounded-full bg-surface border border-border mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted opacity-40"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <p className="text-text-muted text-[13px] font-black tracking-widest uppercase opacity-60">
                                    You've reached the end of the results.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Fixed Map */}
                <div className={`lg:w-1/2 h-full bg-surface sticky top-[calc(var(--header-height)+81px)] z-0 ${!showMap ? 'hidden lg:block' : 'block w-full fixed inset-0 z-20 top-[calc(var(--header-height)+81px)]'}`}>
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
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white" onScroll={handleScroll}>
                    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
                        {isLoading ? (
                            <div className="space-y-3">
                                {Array(8).fill(0).map((_, i) => (
                                    <div key={i} className="h-[170px] rounded-2xl bg-surface animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div>
                                {filteredProperties.map((p, idx) => (
                                    <PropertyPost
                                        key={p.id}
                                        property={p}
                                        isFirstInSet={idx === 0}
                                        isLastInSet={idx === filteredProperties.length - 1}
                                    />
                                ))}
                            </div>
                        )}

                        {isLoadingMore && (
                            <div className="flex justify-center py-8 gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
