'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PropertyPost } from '@/components/cards/PropertyFeedCard';

const MapComponent = dynamic(() => import('@/app/explore/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-slate-100" />
});

function normalize(value: unknown) {
    return String(value || '').toLowerCase();
}

function splitFilters(value: string | null): string[] {
    if (!value) return [];
    return value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function normalizeArea(area: number | null | undefined, unit?: string) {
    if (area === null || area === undefined || Number.isNaN(Number(area))) return null;

    const numericArea = Number(area);
    const normalizedUnit = (unit || '').toLowerCase();

    if (normalizedUnit.includes('sqft') || normalizedUnit.includes('sq.ft')) {
        return numericArea / 10.7639;
    }

    return numericArea;
}

function hasValidCoordinates(property: any) {
    const latRaw = property?.latitude;
    const lngRaw = property?.longitude;

    if (latRaw === null || latRaw === undefined || latRaw === '') return false;
    if (lngRaw === null || lngRaw === undefined || lngRaw === '') return false;

    const latitude = Number(latRaw);
    const longitude = Number(lngRaw);

    return Number.isFinite(latitude) && Number.isFinite(longitude);
}

function isWithinBounds(property: any, bounds: { north: number; south: number; east: number; west: number }) {
    const latitude = Number(property?.latitude);
    const longitude = Number(property?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;

    const latBuffer = Math.max((bounds.north - bounds.south) * 0.15, 0.02);
    const lngBuffer = Math.max((bounds.east - bounds.west) * 0.15, 0.02);

    return latitude <= bounds.north + latBuffer && latitude >= bounds.south - latBuffer && longitude <= bounds.east + lngBuffer && longitude >= bounds.west - lngBuffer;
}

export default function MapsClient({ initialUser: _initialUser, initialQuery = '', initialProperties = [] }: { initialUser: any, initialQuery?: string, initialProperties?: any[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(initialQuery);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
    const [isDesktop, setIsDesktop] = useState(false);
    const properties = initialProperties;
    const loading = false;

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const syncViewport = () => setIsDesktop(mediaQuery.matches);

        syncViewport();
        mediaQuery.addEventListener('change', syncViewport);
        return () => mediaQuery.removeEventListener('change', syncViewport);
    }, []);

    const filteredProperties = useMemo(() => {
        const q = query.trim().toLowerCase();
        const selectedLocations = splitFilters(searchParams.get('locations'));
        const listedByFilter = (searchParams.get('listedBy') || '').trim().toLowerCase();
        const typeFilters = splitFilters(searchParams.get('types'));
        const sizeMin = searchParams.get('sizeMin');
        const sizeMax = searchParams.get('sizeMax');
        const minSize = sizeMin ? Number(sizeMin) : null;
        const maxSize = sizeMax ? Number(sizeMax) : null;
        const rawMinPrice = searchParams.get('modifiedMinPrice') || searchParams.get('rawMinPrice');
        const rawMaxPrice = searchParams.get('modifiedMaxPrice') || searchParams.get('rawMaxPrice');
        const minPrice = rawMinPrice ? Number(rawMinPrice) : null;
        const maxPrice = rawMaxPrice ? Number(rawMaxPrice) : null;

        if (!q && selectedLocations.length === 0 && !listedByFilter && typeFilters.length === 0 && minSize === null && maxSize === null && minPrice === null && maxPrice === null) return properties;

        return properties.filter((property) => {
            const values = [
                property.title,
                property.location,
                property.price,
                property.specs,
                ...(property.property_types || []),
            ].map(normalize);

            const matchesQuery = !q || values.some((value) => value.includes(q));
            const locationLabel = normalize(property.location);
            const matchesLocation = selectedLocations.length === 0 || selectedLocations.some((location) => locationLabel.includes(location));
            const matchesListedBy = !listedByFilter || normalize(property.listedBy?.type) === listedByFilter;
            const propertyTypes = (property.property_types || []).map((item: string) => normalize(item));
            const matchesType = typeFilters.length === 0 || typeFilters.some((type) => propertyTypes.some((item) => item.includes(type) || type.includes(item)));
            const propertyArea = normalizeArea(property.features?.builtUpArea, property.features?.builtUpAreaUnit);
            const matchesSize = (minSize === null || propertyArea === null || propertyArea >= minSize) && (maxSize === null || propertyArea === null || propertyArea <= maxSize);
            const propertyPrice = Number(property.pricing?.price || property.price || NaN);
            const matchesPrice = (minPrice === null || Number.isNaN(propertyPrice) || propertyPrice >= minPrice) && (maxPrice === null || Number.isNaN(propertyPrice) || propertyPrice <= maxPrice);

            return matchesQuery && matchesLocation && matchesListedBy && matchesType && matchesSize && matchesPrice;
        });
    }, [properties, query, searchParams]);

    const mapProperties = filteredProperties.filter(hasValidCoordinates);

    const visibleProperties = useMemo(() => {
        if (!mapBounds) return mapProperties;

        const withinBounds = mapProperties.filter((property) => isWithinBounds(property, mapBounds));
        return withinBounds;
    }, [mapBounds, mapProperties]);

    const submitSearch = () => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (query.trim()) {
            params.set('rawQuery', query.trim());
        } else {
            params.delete('rawQuery');
        }
        params.delete('q');
        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
    };

    const handleMarkerClick = (id: number) => {
        setSelectedId(id);
        const element = document.querySelector(`[data-map-result-id="${id}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleMarkerHover = (id: number) => {
        setSelectedId(id);
    };

    const handleMarkerLeave = () => {
        setSelectedId(null);
    };

    return (
        <main className="min-h-screen bg-surface pt-[var(--header-height)] lg:h-screen lg:overflow-hidden">
            <section className="mx-auto grid w-full max-w-none gap-6 px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6 lg:pb-6 lg:grid-cols-2 lg:h-[calc(100vh-var(--header-height)-24px)] lg:items-stretch">
                <aside className="order-1 min-w-0 space-y-4 lg:order-1 lg:h-full lg:overflow-y-auto">
                    <div className="relative">
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') submitSearch();
                            }}
                            placeholder="Search map results"
                            className="w-full rounded-full border border-border bg-white px-5 py-4 pr-14 text-[15px] font-medium text-text-main shadow-sm outline-none transition focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)]/10"
                        />
                        <button
                            onClick={submitSearch}
                            aria-label="Search map properties"
                            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-gold)] text-white transition hover:opacity-90 active:scale-95"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </button>
                    </div>

                    <div className="order-2 min-w-0 lg:hidden">
                        {!isDesktop && (
                            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden h-[42vh] min-h-[300px]">
                                <MapComponent
                                    properties={mapProperties}
                                    center={[27.7172, 85.324]}
                                    zoom={12}
                                    selectedId={selectedId}
                                    onMarkerClick={handleMarkerClick}
                                    onMarkerHover={handleMarkerHover}
                                    onMarkerLeave={handleMarkerLeave}
                                    onBoundsChange={setMapBounds}
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-[102px] rounded-[1.5rem] border border-border bg-white animate-pulse" />
                            ))
                        ) : visibleProperties.length > 0 ? (
                            <div className="rounded-[28px] border border-slate-300 bg-white shadow-[var(--shadow-card)] overflow-hidden">
                                {visibleProperties.map((property, index) => (
                                    <div
                                        key={property.id}
                                        data-map-result-id={property.id}
                                        onMouseEnter={() => setSelectedId(property.id)}
                                        className={`transition-all duration-200 rounded-[12px] ${selectedId === property.id ? 'ring-2 ring-inset ring-[color:var(--color-primary)]/45 bg-[color:var(--color-primary)]/5' : ''}`}
                                    >
                                        <PropertyPost
                                            property={property}
                                            isFirstInSet={index === 0}
                                            isLastInSet={index === visibleProperties.length - 1}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[1.5rem] border border-border bg-white p-6 text-center shadow-sm">
                                <p className="text-sm font-semibold text-text-main">No map results found.</p>
                                <p className="mt-2 text-sm text-text-muted">Move the map or broaden your search.</p>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="order-2 hidden min-w-0 lg:order-2 lg:block lg:h-full">
                    {isDesktop && (
                        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
                            <MapComponent
                                properties={mapProperties}
                                center={[27.7172, 85.324]}
                                zoom={12}
                                selectedId={selectedId}
                                onMarkerClick={handleMarkerClick}
                                onMarkerHover={handleMarkerHover}
                                onMarkerLeave={handleMarkerLeave}
                                onBoundsChange={setMapBounds}
                            />
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
