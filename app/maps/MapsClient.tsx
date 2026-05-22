'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MapComponent from '@/app/explore/MapComponent';

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

function getPropertyLocationLabel(property: any) {
    if (!property?.location) return '';
    if (typeof property.location === 'string') return property.location;

    return [property.location.area, property.location.cityVillage, property.location.city, property.location.district]
        .filter(Boolean)
        .join(', ')
        .toLowerCase();
}

function isWithinBounds(property: any, bounds: { north: number; south: number; east: number; west: number }) {
    const latitude = Number(property?.latitude);
    const longitude = Number(property?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;

    const latBuffer = Math.max((bounds.north - bounds.south) * 0.15, 0.02);
    const lngBuffer = Math.max((bounds.east - bounds.west) * 0.15, 0.02);

    return latitude <= bounds.north + latBuffer && latitude >= bounds.south - latBuffer && longitude <= bounds.east + lngBuffer && longitude >= bounds.west - lngBuffer;
}

function getBoundsCenter(bounds: { north: number; south: number; east: number; west: number }) {
    return {
        latitude: (bounds.north + bounds.south) / 2,
        longitude: (bounds.east + bounds.west) / 2,
    };
}

function getDistanceScore(property: any, center: { latitude: number; longitude: number }) {
    const latitude = Number(property?.latitude);
    const longitude = Number(property?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return Number.POSITIVE_INFINITY;

    return Math.hypot(latitude - center.latitude, longitude - center.longitude);
}

export default function MapsClient({ initialUser, initialQuery = '', initialProperties = [] }: { initialUser: any, initialQuery?: string, initialProperties?: any[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(initialQuery);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
    const properties = initialProperties;
    const loading = false;

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

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

    const mapProperties = filteredProperties.filter((property) => Number.isFinite(Number(property.latitude)) && Number.isFinite(Number(property.longitude)));

    const visibleProperties = useMemo(() => {
        if (!mapBounds) return mapProperties;

        const withinBounds = mapProperties.filter((property) => isWithinBounds(property, mapBounds));
        if (withinBounds.length > 0) return withinBounds;

        const center = getBoundsCenter(mapBounds);
        return [...mapProperties]
            .sort((left, right) => getDistanceScore(left, center) - getDistanceScore(right, center))
            .slice(0, 12);
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

    return (
        <main className="min-h-screen bg-surface pb-12">
            <section className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
                <div className="rounded-[2rem] border border-border bg-white p-5 sm:p-6 shadow-sm">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-gold)]/20 bg-[color:var(--color-gold)]/8 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[color:var(--color-gold)]">
                                Map focus
                                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-gold)]" />
                            </div>
                            <div className="mt-4 text-sm font-bold text-[color:var(--color-primary)]/80">
                                {initialUser?.name ? `Hello, ${initialUser.name.split(' ')[0]}` : 'Map-first browsing'}
                            </div>
                            <h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-text-main">
                                Browse by map, with results that follow the viewport.
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm sm:text-base text-text-muted">
                                On mobile, the map stays on top and the list fills the lower half. On desktop, the results sit on the left and the map sits on the right.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                            <div className="relative flex-1 sm:min-w-[280px] lg:max-w-[360px]">
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') submitSearch();
                                    }}
                                    placeholder="Search within the visible map area"
                                    className="w-full rounded-full border border-border bg-surface px-5 py-4 pr-14 text-[15px] font-medium text-text-main shadow-sm outline-none transition focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)]/10"
                                />
                                <button
                                    onClick={submitSearch}
                                    aria-label="Search map properties"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-gold)] text-white shadow-lg shadow-[color:var(--color-gold)]/20 transition hover:opacity-90 active:scale-95"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </button>
                            </div>
                            <Link href="/search" className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-4 text-sm font-black uppercase tracking-widest text-text-main transition hover:border-[color:var(--color-primary)]/20 hover:text-[color:var(--color-primary)]">
                                Feed view
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-[var(--container-max)] gap-6 px-4 sm:px-6 lg:px-8 pt-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <aside className="order-2 min-w-0 space-y-4 lg:order-1 lg:h-[calc(100vh-var(--header-height)-170px)] lg:overflow-y-auto lg:sticky lg:top-[calc(var(--header-height)+24px)]">
                    <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-sm">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Visible results</div>
                                <h2 className="mt-1 text-2xl font-black text-text-main">{visibleProperties.length}</h2>
                            </div>
                            <div className="rounded-full bg-[color:var(--color-primary)]/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--color-primary)]">
                                {loading ? 'Loading' : 'Live'}
                            </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-text-muted">
                            Results update from the current map viewport and any search term you enter.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-[102px] rounded-[1.5rem] border border-border bg-white animate-pulse" />
                            ))
                        ) : visibleProperties.length > 0 ? (
                            visibleProperties.map((property) => (
                                <Link
                                    key={property.id}
                                    data-map-result-id={property.id}
                                    href={`/properties/${property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${property.id}`}
                                    className={`block rounded-[1.5rem] border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedId === property.id ? 'border-[color:var(--color-primary)]/40 ring-2 ring-[color:var(--color-primary)]/10' : 'border-border'}`}
                                    onMouseEnter={() => setSelectedId(property.id)}
                                >
                                    <div className="flex gap-4">
                                        <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-surface">
                                            <img
                                                src={property.images?.[0] || 'https://via.placeholder.com/200'}
                                                alt={property.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">{property.property_types?.[0] || 'Property'}</div>
                                            <h3 className="mt-1 truncate text-[15px] font-bold text-text-main">{property.title}</h3>
                                            <div className="mt-1 text-sm font-black text-[color:var(--color-primary)]">{property.price}</div>
                                            <div className="mt-1 truncate text-xs text-text-muted">{getPropertyLocationLabel(property) || 'Location unavailable'}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="rounded-[1.5rem] border border-border bg-white p-6 text-center shadow-sm">
                                <p className="text-sm font-semibold text-text-main">No map results found.</p>
                                <p className="mt-2 text-sm text-text-muted">Move the map to a denser area or broaden the search term.</p>
                                <Link href="/search" className="mt-4 inline-flex rounded-full bg-[color:var(--color-primary)] px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
                                    Open search feed
                                </Link>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="order-1 min-w-0 lg:order-2">
                    <div className="rounded-[2rem] border border-border bg-white shadow-sm overflow-hidden h-[52vh] min-h-[360px] lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:h-[calc(100vh-var(--header-height)-170px)]">
                    <MapComponent
                        properties={mapProperties}
                        center={[27.7172, 85.324]}
                        zoom={12}
                        selectedId={selectedId}
                        onMarkerClick={handleMarkerClick}
                        onBoundsChange={setMapBounds}
                    />
                    </div>
                    </div>
            </section>
        </main>
    );
}