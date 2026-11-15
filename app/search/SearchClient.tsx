'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PropertyPost } from '@/components/cards/PropertyFeedCard';
import { TrendingSearches } from '@/components/cards/TrendingSearches';
import { PopularCategories } from '@/components/cards/PopularCategories';
import { convertAreaValue, normalizeAreaUnit } from '@/lib/area-units';
import { matchesAnyLocationFilter, splitLocationFilterValues } from '@/lib/location-filters';

function normalize(value: unknown) {
    return String(value || '').toLowerCase();
}

function splitFilters(value: string | null): string[] {
    if (!value) return [];
    return value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function sortProperties(properties: any[], sortBy: string | null) {
    if (sortBy !== 'price' && sortBy !== 'date') return properties;

    return [...properties].sort((left, right) => {
        if (sortBy === 'date') {
            return new Date(right.created_on || right.createdAt || 0).getTime() - new Date(left.created_on || left.createdAt || 0).getTime();
        }

        const leftPrice = getListedPrice(left) ?? Number.POSITIVE_INFINITY;
        const rightPrice = getListedPrice(right) ?? Number.POSITIVE_INFINITY;
        return leftPrice - rightPrice;
    });
}

// Returns the listing's numeric price, independent of its formatted card label.
function getListedPrice(property: any): number | null {
    const rawPrice = property.price_listed ?? property.pricing?.price;
    if (rawPrice == null || rawPrice === '') return null;
    const listedPrice = Number(rawPrice);
    return Number.isFinite(listedPrice) ? listedPrice : null;
}

export default function SearchClient({ initialUser, initialQuery = '', initialProperties = [] }: { initialUser: any, initialQuery?: string, initialProperties?: any[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(initialQuery);
    const properties = initialProperties;
    const loading = false;

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    const filteredProperties = useMemo(() => {
        const q = query.trim().toLowerCase();
        const selectedLocations = splitLocationFilterValues(searchParams.get('locations'));
        const listedByFilter = (searchParams.get('listedBy') || '').trim().toLowerCase();
        const typeFilters = splitFilters(searchParams.get('types'));
        const categoryFilter = (searchParams.get('category') || '').trim().toLowerCase();
        const sizeMin = searchParams.get('sizeMin');
        const sizeMax = searchParams.get('sizeMax');
        const sizeUnit = normalizeAreaUnit(searchParams.get('sizeUnit'));
        const minSize = sizeMin ? Number(sizeMin) : null;
        const maxSize = sizeMax ? Number(sizeMax) : null;
        const rawMinPrice = searchParams.get('modifiedMinPrice') || searchParams.get('rawMinPrice');
        const rawMaxPrice = searchParams.get('modifiedMaxPrice') || searchParams.get('rawMaxPrice');
        const minPrice = rawMinPrice ? Number(rawMinPrice) : null;
        const maxPrice = rawMaxPrice ? Number(rawMaxPrice) : null;
        const sortBy = searchParams.get('sortBy');

        if (!q && selectedLocations.length === 0 && !listedByFilter && typeFilters.length === 0 && !categoryFilter && minSize === null && maxSize === null && minPrice === null && maxPrice === null) {
            return sortProperties(properties, sortBy);
        }

        return sortProperties(properties.filter((property) => {
            const values = [
                property.title,
                property.location,
                property.price,
                property.specs,
                ...(property.property_types || []),
            ].map(normalize);

            const matchesQuery = !q || values.some((value) => value.includes(q));
            const locationLabel = normalize(property.location);
            const locationParts = locationLabel.split(',').map((item) => item.trim()).filter(Boolean);
            const matchesLocation = matchesAnyLocationFilter(locationParts, selectedLocations);
            const matchesListedBy = !listedByFilter || normalize(property.listedBy?.type) === listedByFilter;
            const propertyTypes = (property.property_types || []).map((item: string) => normalize(item));
            const matchesType = typeFilters.length === 0 || typeFilters.some((type) => propertyTypes.some((item: string) => item.includes(type) || type.includes(item)));
            const propertyNatures = (property.property_natures || []).map((item: string) => normalize(item).replace(/\s+/g, '-'));
            const matchesCategory = !categoryFilter || propertyNatures.some((item: string) => item === categoryFilter);
            const propertyArea = Number.isFinite(Number(property.features?.builtUpArea))
                ? convertAreaValue(Number(property.features?.builtUpArea), property.features?.builtUpAreaUnit, sizeUnit)
                : null;
            const matchesSize = (minSize === null || propertyArea === null || propertyArea >= minSize) && (maxSize === null || propertyArea === null || propertyArea <= maxSize);
            const propertyPrice = getListedPrice(property);
            const matchesPrice = (minPrice === null || (propertyPrice !== null && propertyPrice >= minPrice)) && (maxPrice === null || (propertyPrice !== null && propertyPrice <= maxPrice));

            return matchesQuery && matchesLocation && matchesListedBy && matchesType && matchesCategory && matchesSize && matchesPrice;
        }), sortBy);
    }, [properties, query, searchParams]);

    const categoryLinks = [
        { label: 'House', href: '/search?q=house' },
        { label: 'Land', href: '/search?q=land' },
        { label: 'Apartment', href: '/search?q=apartment' },
        { label: 'Office Space', href: '/search?q=office' },
    ];

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

    return (
        <main className="min-h-screen bg-[#f7f8fa] pb-14">
            <section className="relative overflow-hidden border-b border-border bg-white">
                <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[color:var(--color-primary)]/[0.045] blur-3xl" />
                <div className="relative mx-auto max-w-[var(--container-max)] px-4 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-[color:var(--color-primary)]/10 px-3.5 py-2 text-[10px] font-black uppercase leading-none tracking-[0.16em] text-[color:var(--color-primary)]">
                            Find your next place <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
                        </div>
                        <h1 className="mt-4 text-3xl font-black tracking-tight text-text-main sm:text-4xl lg:text-5xl">
                            Search properties across Nepal
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
                            Search by place, property type, or price, then browse the listings that fit.
                        </p>

                        <div className="mx-auto mt-7 flex max-w-3xl flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') submitSearch();
                                    }}
                                    placeholder="Try Kathmandu, land, apartment..."
                                    aria-label="Search properties by location, title, price, or type"
                                        className="h-14 w-full rounded-2xl border border-border bg-white px-5 pr-16 text-[15px] font-medium text-text-main shadow-[0_5px_20px_rgba(15,23,42,0.06)] [outline:none] transition placeholder:text-text-muted/70 focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[color:var(--color-primary)]/10"
                                />
                                <button
                                    onClick={submitSearch}
                                    aria-label="Search properties"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-12 items-center justify-center rounded-xl bg-[color:var(--color-primary)] text-white shadow-sm outline-none transition hover:bg-[color:var(--color-primary-light)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]/25 active:scale-95"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </button>
                            </div>

                                <Link href="/maps" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 text-xs font-black uppercase tracking-[0.12em] text-text-main outline-none transition hover:border-[color:var(--color-primary)]/30 hover:text-[color:var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]/25">
                                <span aria-hidden="true">⌖</span> Map view
                            </Link>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                            <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">Popular:</span>
                            {categoryLinks.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                        className="rounded-full border border-border bg-[#fafafa] px-3.5 py-2 text-xs font-bold text-text-main outline-none transition hover:border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/[0.04] hover:text-[color:var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]/20"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    </div>
            </section>

            <section className="mx-auto grid max-w-[var(--container-max)] gap-7 px-4 pt-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8 lg:pt-9">
                <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-white px-5 py-4 shadow-sm">
                        <div>
                            <h2 className="text-lg font-black tracking-tight text-text-main sm:text-xl">Property listings</h2>
                            <p className="mt-0.5 text-xs text-text-muted sm:text-sm">
                                {query.trim() ? `Showing matches for “${query.trim()}”` : 'Browse the latest places on the market'}
                            </p>
                        </div>
                        <div className="rounded-full bg-[color:var(--color-primary)]/[0.07] px-3 py-1.5 text-xs font-extrabold text-[color:var(--color-primary)]">
                            {filteredProperties.length} {filteredProperties.length === 1 ? 'listing' : 'listings'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-[190px] rounded-[1.5rem] bg-white/80 animate-pulse" />
                            ))
                        ) : filteredProperties.length > 0 ? (
                            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)]">
                                {filteredProperties.map((property, index) => (
                                    <PropertyPost
                                        key={property.id}
                                        property={property}
                                        isFirstInSet={index === 0}
                                        isLastInSet={index === filteredProperties.length - 1}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-border bg-white px-6 py-14 text-center shadow-sm sm:px-10">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--color-primary)]/[0.07] text-2xl text-[color:var(--color-primary)]">⌕</div>
                                <h3 className="text-lg font-black text-text-main">No listings matched</h3>
                                <p className="mt-2 text-sm text-text-muted">Try a broader search term or clear the query to see the full feed.</p>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:self-start">
                    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Quick jump</div>
                                <h3 className="mt-1 text-lg font-black text-text-main">Need the map?</h3>
                            </div>
                            <Link href="/maps" className="rounded-full bg-[color:var(--color-primary)] px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[color:var(--color-primary-light)]">
                                Maps
                            </Link>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-text-muted">
                            Explore listings by location and see what is nearby on the interactive map.
                        </p>
                    </div>

                    <TrendingSearches
                        className="!bg-white"
                        searches={['Kathmandu', 'Lalitpur', 'Apartment', 'Land', 'House', 'Office Space']}
                    />

                    <PopularCategories />
                </aside>
            </section>
        </main>
    );
}
