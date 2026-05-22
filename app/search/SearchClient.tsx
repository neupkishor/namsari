'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PropertyPost } from '@/components/cards/PropertyFeedCard';
import { TrendingSearches } from '@/components/cards/TrendingSearches';
import { PopularCategories } from '@/components/cards/PopularCategories';

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
        const selectedLocations = splitFilters(searchParams.get('locations'));
        const listedByFilter = (searchParams.get('listedBy') || '').trim().toLowerCase();
        const typeFilters = splitFilters(searchParams.get('types'));
        const sizeMin = searchParams.get('sizeMin');
        const sizeMax = searchParams.get('sizeMax');
        const sizeUnit = (searchParams.get('sizeUnit') || '').toLowerCase();
        const minSize = sizeMin ? Number(sizeMin) : null;
        const maxSize = sizeMax ? Number(sizeMax) : null;
        const rawMinPrice = searchParams.get('modifiedMinPrice') || searchParams.get('rawMinPrice');
        const rawMaxPrice = searchParams.get('modifiedMaxPrice') || searchParams.get('rawMaxPrice');
        const minPrice = rawMinPrice ? Number(rawMinPrice) : null;
        const maxPrice = rawMaxPrice ? Number(rawMaxPrice) : null;

        if (!q && selectedLocations.length === 0 && !listedByFilter && typeFilters.length === 0 && minSize === null && maxSize === null && minPrice === null && maxPrice === null) {
            return properties;
        }

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
            const matchesType = typeFilters.length === 0 || typeFilters.some((type) => propertyTypes.some((item: string) => item.includes(type) || type.includes(item)));
            const propertyArea = normalizeArea(property.features?.builtUpArea, property.features?.builtUpAreaUnit);
            const matchesSize = (minSize === null || propertyArea === null || propertyArea >= minSize) && (maxSize === null || propertyArea === null || propertyArea <= maxSize);
            const propertyPrice = Number(property.pricing?.price || property.price || NaN);
            const matchesPrice = (minPrice === null || Number.isNaN(propertyPrice) || propertyPrice >= minPrice) && (maxPrice === null || Number.isNaN(propertyPrice) || propertyPrice <= maxPrice);

            return matchesQuery && matchesLocation && matchesListedBy && matchesType && matchesSize && matchesPrice;
        });
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
        <main className="min-h-screen bg-surface pb-12">
            <section className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
                <div className="rounded-[2rem] border border-border bg-white p-5 sm:p-6 shadow-sm">
                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary)]/15 bg-[color:var(--color-primary)]/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[color:var(--color-primary)]">
                                Feed search
                                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
                            </div>

                            <div>
                                <div className="text-sm font-bold text-[color:var(--color-primary)]/80">
                                    {initialUser?.name ? `Welcome back, ${initialUser.name.split(' ')[0]}` : 'Search the market'}
                                </div>
                                <h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-text-main">
                                    Search properties without leaving the feed.
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm sm:text-base text-text-muted">
                                    Browse listings in a familiar card layout, then jump to the map when location matters more than the scroll.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <input
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') submitSearch();
                                        }}
                                        placeholder="Search by location, title, price, or type"
                                        className="w-full rounded-full border border-border bg-surface px-5 py-4 pr-14 text-[15px] font-medium text-text-main shadow-sm outline-none transition focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-primary)]/10"
                                    />
                                    <button
                                        onClick={submitSearch}
                                        aria-label="Search properties"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white shadow-lg shadow-[color:var(--color-primary)]/20 transition hover:bg-[color:var(--color-primary-light)] active:scale-95"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                    </button>
                                </div>

                                <Link href="/maps" className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-4 text-sm font-black uppercase tracking-widest text-text-main shadow-sm transition hover:border-[color:var(--color-primary)]/20 hover:text-[color:var(--color-primary)]">
                                    Open maps
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {categoryLinks.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-text-main transition hover:border-[color:var(--color-primary)]/25 hover:bg-[color:var(--color-primary)]/5"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-1">
                            <div className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-sm">
                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">Results</div>
                                <div className="mt-2 text-3xl font-black text-text-main">{filteredProperties.length}</div>
                                <div className="mt-1 text-xs text-text-muted">Listings matching your feed query</div>
                            </div>
                            <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">View</div>
                                <div className="mt-2 text-xl font-black text-text-main">Feed-first</div>
                                <div className="mt-1 text-xs text-text-muted">A scrollable results page built for browsing.</div>
                            </div>
                            <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">State</div>
                                <div className="mt-2 text-xl font-black text-text-main">{loading ? 'Loading' : 'Ready'}</div>
                                <div className="mt-1 text-xs text-text-muted">Live inventory from the properties API.</div>
                            </div>
                            <Link href="/maps" className="rounded-[1.5rem] border border-[color:var(--color-primary)]/15 bg-[linear-gradient(135deg,rgba(130,0,0,0.06),rgba(184,150,12,0.06))] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--color-primary)]">Switch mode</div>
                                <div className="mt-2 text-xl font-black text-text-main">Map view</div>
                                <div className="mt-1 text-xs text-text-muted">See where listings cluster geographically.</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-[var(--container-max)] gap-8 px-4 sm:px-6 lg:px-8 pt-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.82fr)]">
                <div className="min-w-0">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-text-main">Property feed</h2>
                            <p className="text-sm text-text-muted">Results in a fast, scrollable feed view.</p>
                        </div>
                        <div className="hidden sm:block text-[12px] font-black uppercase tracking-[0.18em] text-text-muted">
                            {filteredProperties.length} visible
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-[190px] rounded-[1.5rem] border border-border bg-white/80 animate-pulse" />
                            ))
                        ) : filteredProperties.length > 0 ? (
                            <div className="rounded-[28px] border border-slate-300 bg-white shadow-[var(--shadow-card)] overflow-hidden">
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
                            <div className="rounded-[1.5rem] border border-border bg-white p-8 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-primary)]/5 text-2xl">⌕</div>
                                <h3 className="text-lg font-black text-text-main">No listings matched</h3>
                                <p className="mt-2 text-sm text-text-muted">Try a broader search term or clear the query to see the full feed.</p>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:self-start">
                    <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-sm">
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
                            Use the map page when location matters more than the feed. This page stays focused on browsing and comparing listings.
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
