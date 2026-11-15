'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PropertyPost } from '@/components/cards/PropertyFeedCard';
import { convertAreaValue, normalizeAreaUnit } from '@/services/properties/area-units';
import { matchesAnyLocationFilter, splitLocationFilterValues } from '@/services/properties/location-filters';

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

export default function SearchClient({ children, initialUser, initialQuery = '', initialProperties = [] }: { children?: React.ReactNode, initialUser?: any, initialQuery?: string, initialProperties?: any[] }) {
    if (children !== undefined) return <>{children}</>;

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(initialQuery);
    const [locations, setLocations] = useState(searchParams.get('locations') || '');
    const [types, setTypes] = useState(splitFilters(searchParams.get('types')));
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [listedBy, setListedBy] = useState(searchParams.get('listedBy') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('modifiedMinPrice') || searchParams.get('rawMinPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('modifiedMaxPrice') || searchParams.get('rawMaxPrice') || '');
    const [minSize, setMinSize] = useState(searchParams.get('sizeMin') || '');
    const [maxSize, setMaxSize] = useState(searchParams.get('sizeMax') || '');
    const [sizeUnit, setSizeUnit] = useState(normalizeAreaUnit(searchParams.get('sizeUnit')));
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
    const properties = initialProperties;
    const loading = false;

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        setLocations(searchParams.get('locations') || '');
        setTypes(splitFilters(searchParams.get('types')));
        setCategory(searchParams.get('category') || '');
        setListedBy(searchParams.get('listedBy') || '');
        setMinPrice(searchParams.get('modifiedMinPrice') || searchParams.get('rawMinPrice') || '');
        setMaxPrice(searchParams.get('modifiedMaxPrice') || searchParams.get('rawMaxPrice') || '');
        setMinSize(searchParams.get('sizeMin') || '');
        setMaxSize(searchParams.get('sizeMax') || '');
        setSizeUnit(normalizeAreaUnit(searchParams.get('sizeUnit')));
        setSortBy(searchParams.get('sortBy') || '');
    }, [searchParams]);

    const filteredProperties = useMemo(() => {
        const q = query.trim().toLowerCase();
        const selectedLocations = splitLocationFilterValues(searchParams.get('locations'));
        const listedByFilter = (searchParams.get('listedBy') || '').trim().toLowerCase();
        const typeFilters = splitFilters(searchParams.get('types'));
        const categoryFilter = (searchParams.get('category') || '').trim().toLowerCase();
        const sizeMin = searchParams.get('sizeMin');
        const sizeMax = searchParams.get('sizeMax');
        const activeSizeUnit = normalizeAreaUnit(searchParams.get('sizeUnit'));
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
            const propertyTypes = (property.property_types || []).map((item: string) => normalize(item).replace(/_/g, ' '));
            const matchesType = typeFilters.length === 0 || typeFilters.some((type) => propertyTypes.some((item: string) => item.includes(type.replace(/_/g, ' ')) || type.replace(/_/g, ' ').includes(item)));
            const propertyNatures = (property.property_natures || []).map((item: string) => normalize(item).replace(/\s+/g, '-'));
            const matchesCategory = !categoryFilter || propertyNatures.some((item: string) => item === categoryFilter);
            const propertyArea = Number.isFinite(Number(property.features?.builtUpArea))
                ? convertAreaValue(Number(property.features?.builtUpArea), 'sqm', activeSizeUnit)
                : null;
            const matchesSize = (minSize === null || propertyArea === null || propertyArea >= minSize) && (maxSize === null || propertyArea === null || propertyArea <= maxSize);
            const propertyPrice = getListedPrice(property);
            const matchesPrice = (minPrice === null || (propertyPrice !== null && propertyPrice >= minPrice)) && (maxPrice === null || (propertyPrice !== null && propertyPrice <= maxPrice));

            return matchesQuery && matchesLocation && matchesListedBy && matchesType && matchesCategory && matchesSize && matchesPrice;
        }), sortBy);
    }, [properties, query, searchParams]);

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

    // Applies the visible search filters to the URL so the result state is shareable.
    const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const params = new URLSearchParams(searchParams?.toString() || '');
        const locationValues = locations.split(',').map((value) => value.trim()).filter(Boolean);

        params.delete('q');
        if (query.trim()) params.set('rawQuery', query.trim());
        else params.delete('rawQuery');
        if (locationValues.length) params.set('locations', locationValues.join(','));
        else params.delete('locations');
        if (types.length) params.set('types', types.join(','));
        else params.delete('types');
        if (category) params.set('category', category);
        else params.delete('category');
        if (listedBy) params.set('listedBy', listedBy);
        else params.delete('listedBy');
        if (minPrice) params.set('modifiedMinPrice', minPrice);
        else params.delete('modifiedMinPrice');
        if (maxPrice) params.set('modifiedMaxPrice', maxPrice);
        else params.delete('modifiedMaxPrice');
        if (minSize) params.set('sizeMin', minSize);
        else params.delete('sizeMin');
        if (maxSize) params.set('sizeMax', maxSize);
        else params.delete('sizeMax');
        if (sizeUnit) params.set('sizeUnit', sizeUnit);
        else params.delete('sizeUnit');
        if (sortBy) params.set('sortBy', sortBy);
        else params.delete('sortBy');

        const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(nextUrl, { scroll: false });
    };

    // Clears all visible filters while retaining the current search query.
    const clearFilters = () => {
        setLocations('');
        setTypes([]);
        setCategory('');
        setListedBy('');
        setMinPrice('');
        setMaxPrice('');
        setMinSize('');
        setMaxSize('');
        setSizeUnit('sqm');
        setSortBy('');
        const params = new URLSearchParams();
        if (query.trim()) params.set('rawQuery', query.trim());
        router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    };

    return (
        <>
            <main className="min-h-screen bg-[#f7f8fa] pb-14 pt-[var(--header-height)]">
                {children}
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

                                <Link href="/maps" className="inline-flex h-11 shrink-0 self-center items-center justify-center gap-2 rounded-full bg-[color:var(--color-primary)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(10,107,255,0.28)] transition-all hover:opacity-90">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
                                        <path d="M9 4v14" />
                                        <path d="M15 6v14" />
                                    </svg>
                                    <span>Search in maps</span>
                            </Link>
                    </div>

                    </div>
                    </div>
            </section>

            <section className="mx-auto grid max-w-[var(--container-max)] gap-7 px-4 pt-7 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8 lg:pt-9">
                <aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-sm lg:sticky lg:top-[calc(var(--header-height)+24px)]">
                    <form onSubmit={applyFilters} className="space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-black text-text-main">Filters</h2>
                            <button type="button" onClick={clearFilters} className="text-xs font-bold text-[color:var(--color-primary)] hover:underline">Clear all</button>
                        </div>

                        <label className="block space-y-1.5">
                            <span className="text-xs font-bold text-text-main">Location</span>
                            <input value={locations} onChange={(event) => setLocations(event.target.value)} placeholder="Kathmandu, Lalitpur" className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]" />
                            <span className="block text-[11px] text-text-muted">Separate locations with commas.</span>
                        </label>

                        <fieldset className="space-y-2">
                            <legend className="mb-2 text-xs font-bold text-text-main">Property type</legend>
                            {['house', 'land', 'apartment', 'office space'].map((type) => (
                                <label key={type} className="flex items-center gap-2 text-sm capitalize text-text-main">
                                    <input type="checkbox" checked={types.includes(type)} onChange={(event) => setTypes((current) => event.target.checked ? [...current, type] : current.filter((item) => item !== type))} className="accent-[color:var(--color-primary)]" />
                                    {type}
                                </label>
                            ))}
                        </fieldset>

                        <label className="block space-y-1.5">
                            <span className="text-xs font-bold text-text-main">Category</span>
                            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]">
                                <option value="">All categories</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="semi-commercial">Semi-commercial</option>
                            </select>
                        </label>

                        <label className="block space-y-1.5">
                            <span className="text-xs font-bold text-text-main">Listed by</span>
                            <select value={listedBy} onChange={(event) => setListedBy(event.target.value)} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]">
                                <option value="">Anyone</option>
                                <option value="owner">Owner</option>
                                <option value="agent">Agent</option>
                                <option value="agency">Agency</option>
                            </select>
                        </label>

                        <fieldset className="space-y-2">
                            <legend className="mb-2 text-xs font-bold text-text-main">Price range (NPR)</legend>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min" aria-label="Minimum price" className="min-w-0 rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]" />
                                <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max" aria-label="Maximum price" className="min-w-0 rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]" />
                            </div>
                        </fieldset>

                        <fieldset className="space-y-2">
                            <legend className="mb-2 text-xs font-bold text-text-main">Size range</legend>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" min="0" value={minSize} onChange={(event) => setMinSize(event.target.value)} placeholder="Min" aria-label="Minimum size" className="min-w-0 rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]" />
                                <input type="number" min="0" value={maxSize} onChange={(event) => setMaxSize(event.target.value)} placeholder="Max" aria-label="Maximum size" className="min-w-0 rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]" />
                            </div>
                            <select value={sizeUnit} onChange={(event) => setSizeUnit(normalizeAreaUnit(event.target.value))} aria-label="Size unit" className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]">
                                <option value="sqm">Square meters</option>
                                <option value="sqft">Square feet</option>
                                <option value="aana">Aana</option>
                                <option value="ropani">Ropani</option>
                                <option value="kattha">Kattha</option>
                                <option value="dhur">Dhur</option>
                            </select>
                        </fieldset>

                        <label className="block space-y-1.5">
                            <span className="text-xs font-bold text-text-main">Sort by</span>
                            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)]">
                                <option value="">Most recent</option>
                                <option value="price">Price: low to high</option>
                                <option value="date">Date: newest first</option>
                            </select>
                        </label>

                        <button type="submit" className="w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[color:var(--color-primary-light)]">Apply filters</button>
                    </form>
                </aside>

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

            </section>
            </main>
        </>
    );
}
