"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FeaturedProjects } from '@/components/cards/FeaturedProjects';
import { TrendingSearches } from '@/components/cards/TrendingSearches';
import { FeaturedCollectionsFeedItem } from '@/components/cards/FeaturedCollections';
import { HeroCarouselAd, FeedAd } from '@/components/cards/AdvertisementCard';
import { SectionTitleFeed } from '@/components/sections/SectionTitleFeed';
import { PropertyPost } from '@/components/cards/PropertyFeedCard';
import { formatNPR } from '@/lib/formatters';

const FEATURED_FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
];

function getPropertyImageUrls(property: any): string[] {
    return (property.images || [])
        .map((image: any) => typeof image === 'string' ? image : image?.url)
        .filter(Boolean);
}

function getPropertyLocationLabel(property: any): string {
    const location = property.location;
    if (!location) return 'Location unavailable';

    if (typeof location === 'string') return location;

    return [
        location.area,
        location.cityVillage,
        location.city,
        location.district,
    ].filter(Boolean).slice(0, 2).join(', ') || 'Location unavailable';
}

function getPropertyFactBadges(property: any): string[] {
    const features = property.features;
    if (!features) return [];

    const badges: string[] = [];

    if (features.bedrooms) badges.push(`${features.bedrooms} bed`);
    if (features.bathrooms) badges.push(`${features.bathrooms} bath`);
    if (features.builtUpArea) {
        badges.push(`${features.builtUpArea} ${features.builtUpAreaUnit || 'sq.ft.'}`);
    }

    return badges.slice(0, 3);
}

function resolveFeaturedCards(properties: any[]) {
    const usedImages = new Set<string>();

    return properties.slice(0, 5).map((property, index) => {
        const imageOptions = getPropertyImageUrls(property);
        const imageUrl =
            imageOptions.find((url) => !usedImages.has(url)) ||
            imageOptions[index % Math.max(imageOptions.length, 1)] ||
            FEATURED_FALLBACK_IMAGES[index % FEATURED_FALLBACK_IMAGES.length];

        if (imageUrl) {
            usedImages.add(imageUrl);
        }

        return {
            ...property,
            _displayImage: imageUrl,
        };
    });
}

function FeaturedSmallCard({ property }: { property: any }) {
    const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const propertyUrl = `/properties/${slug}-${property.id}`;
    const factBadges = getPropertyFactBadges(property);
    const typeLabel = property.types?.[0]?.name || 'Property';
    const priceLabel = formatNPR(property.pricing?.price || property.price);
    
    return (
        <Link href={propertyUrl} className="group block h-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[var(--shadow-card)] transition-colors duration-300 hover:border-[color:var(--color-primary)]/40 hover:ring-1 hover:ring-[color:var(--color-primary)]/20">
            <div className="aspect-[4/3] overflow-hidden relative border-b border-slate-200">
                <img 
                    src={property._displayImage} 
                    alt={property.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur">
                        {typeLabel}
                    </span>
                    <span className="inline-flex rounded-full border border-white/15 bg-slate-950/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                        Featured
                    </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="inline-flex rounded-full border border-white/15 bg-slate-950/70 px-3.5 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur">
                        {priceLabel}
                    </div>
                </div>
            </div>
            <div className="flex h-[184px] flex-col gap-3 p-4">
                <div className="space-y-1.5">
                    <h4 className="text-[15px] font-bold leading-tight text-slate-900 line-clamp-2 group-hover:text-[color:var(--color-primary)] transition-colors duration-300">
                        {property.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[12px] text-slate-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="truncate">{getPropertyLocationLabel(property)}</span>
                    </div>
                </div>

                {factBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {factBadges.map((fact) => (
                            <span key={fact} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                {fact}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between text-[12px] font-semibold">
                    <span className="text-slate-400">
                        {property.listedBy?.name || 'Verified listing'}
                    </span>
                    <span className="text-[color:var(--color-primary)] transition-transform duration-200 group-hover:translate-x-0.5">
                        View details
                    </span>
                </div>
            </div>
        </Link>
    );
}

type HomeSearchPanel = 'price' | 'location' | 'size' | 'listedBy' | null;
type ListedByType = 'developer' | 'agent' | 'agency' | 'owner' | 'bank';
type AreaPriceUnit = 'peraana' | 'persqm';

const AANA_TO_SQM = 31.796;

const HOME_LOCATION_OPTIONS = [
    'Kathmandu',
    'Lalitpur',
    'Bhaktapur',
    'Pokhara',
    'Bharatpur',
    'Butwal',
    'Biratnagar',
    'Dharan',
];

const HOME_PRICE_PRESETS = [
    { label: 'Any budget', min: '', max: '' },
    { label: 'Under Rs. 50L', min: '0', max: '5000000' },
    { label: 'Rs. 50L - 1 Cr', min: '5000000', max: '10000000' },
    { label: 'Above Rs. 1 Cr', min: '10000000', max: '' },
];

const HOME_SIZE_PRESETS = [
    { label: 'Any size', min: '', max: '' },
    { label: 'Under 500 m²', min: '0', max: '500' },
    { label: '500 - 2,000 m²', min: '500', max: '2000' },
    { label: 'Above 2,000 m²', min: '2000', max: '' },
];

const HOME_LISTED_BY_OPTIONS: ListedByType[] = ['developer', 'agent', 'agency', 'owner', 'bank'];

function formatHeroMoney(value: string) {
    if (!value) return '';
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return '';
    return formatNPR(parsed);
}

/** Nepali/Indian number system comma formatting: 1,00,00,000 */
function formatDevanagariComma(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    // Last 3 digits, then groups of 2
    if (digits.length <= 3) return digits;
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return `${grouped},${last3}`;
}

/** Convert a raw number string to Nepali word form (crore / lakh / thousand) */
function toNepaliWords(value: string): string {
    const n = Number(value.replace(/\D/g, ''));
    if (!n || Number.isNaN(n)) return '';
    const crore = 1_00_00_000;
    const lakh = 1_00_000;
    const thousand = 1_000;
    const parts: string[] = [];
    let rem = n;
    if (rem >= crore) { parts.push(`${Math.floor(rem / crore)} Crore`); rem %= crore; }
    if (rem >= lakh)  { parts.push(`${Math.floor(rem / lakh)} Lakh`);   rem %= lakh; }
    if (rem >= thousand && parts.length === 0) { parts.push(`${Math.floor(rem / thousand)} Thousand`); rem %= thousand; }
    return parts.join(' ');
}

function convertAreaPriceToModified(unit: AreaPriceUnit, minPrice?: string, maxPrice?: string) {
    const rawMin = minPrice && minPrice !== '' ? Number(minPrice) : null;
    const rawMax = maxPrice && maxPrice !== '' ? Number(maxPrice) : null;

    if (unit === 'peraana') {
        return {
            modifiedUnit: 'persqm',
            modifiedMinPrice: rawMin !== null && Number.isFinite(rawMin) ? String(rawMin / AANA_TO_SQM) : '',
            modifiedMaxPrice: rawMax !== null && Number.isFinite(rawMax) ? String(rawMax / AANA_TO_SQM) : '',
        };
    }

    return {
        modifiedUnit: 'persqm',
        modifiedMinPrice: rawMin !== null && Number.isFinite(rawMin) ? String(rawMin) : '',
        modifiedMaxPrice: rawMax !== null && Number.isFinite(rawMax) ? String(rawMax) : '',
    };
}

function HomeSearchHero() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [activePanel, setActivePanel] = useState<HomeSearchPanel>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [areaPriceUnit, setAreaPriceUnit] = useState<AreaPriceUnit>('peraana');
    const [selectedListedBy, setSelectedListedBy] = useState<ListedByType | null>(null);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [sizeMin, setSizeMin] = useState('');
    const [sizeMax, setSizeMax] = useState('');
    const [sizeUnit, setSizeUnit] = useState<'m2' | 'sqft'>('m2');

    const openModal = (panel: Exclude<HomeSearchPanel, null>) => {
        setActivePanel(panel);
        requestAnimationFrame(() => setIsModalVisible(true));
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setTimeout(() => setActivePanel(null), 220);
    };

    // Close on Escape key
    useEffect(() => {
        if (!activePanel) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [activePanel]);

    const currentPriceLabel = priceMin || priceMax
        ? `${priceMin ? formatHeroMoney(priceMin) : 'Any'} - ${priceMax ? formatHeroMoney(priceMax) : 'Any'} (${areaPriceUnit === 'peraana' ? 'per aana' : 'per m²'})`
        : 'Any budget';

    const currentLocationLabel = selectedLocations.length > 0
        ? `${selectedLocations.length} selected`
        : 'Any location';

    const currentSizeLabel = sizeMin || sizeMax
        ? `${sizeMin || 'Any'} - ${sizeMax || 'Any'} ${sizeUnit === 'm2' ? 'm²' : 'sq.ft.'}`
        : 'Any size';

    const currentListedByLabel = selectedListedBy
        ? `${selectedListedBy.charAt(0).toUpperCase()}${selectedListedBy.slice(1)}`
        : 'Any seller';

    const submitSearch = () => {
        const params = new URLSearchParams();
        const modified = convertAreaPriceToModified(areaPriceUnit, priceMin, priceMax);

        if (query.trim()) params.set('rawQuery', query.trim());
        params.set('type', 'feed');
        if (selectedListedBy) params.set('listedBy', selectedListedBy);
        if (priceMin || priceMax) {
            params.set('rawUnit', areaPriceUnit);
            if (priceMin) params.set('rawMinPrice', priceMin);
            if (priceMax) params.set('rawMaxPrice', priceMax);
            params.set('modifiedUnit', modified.modifiedUnit);
            if (modified.modifiedMinPrice) params.set('modifiedMinPrice', modified.modifiedMinPrice);
            if (modified.modifiedMaxPrice) params.set('modifiedMaxPrice', modified.modifiedMaxPrice);
        }
        if (selectedLocations.length > 0) params.set('locations', selectedLocations.join(','));
        if (sizeMin) params.set('sizeMin', sizeMin);
        if (sizeMax) params.set('sizeMax', sizeMax);
        if (sizeUnit) params.set('sizeUnit', sizeUnit);

        router.push(`/explore${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const toggleLocation = (location: string) => {
        setSelectedLocations((prev) => (
            prev.includes(location)
                ? prev.filter((item) => item !== location)
                : [...prev, location]
        ));
    };

    const renderPanelContent = (panel: Exclude<HomeSearchPanel, null>) => {
        if (panel === 'price') {
            return (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-[15px] font-black text-slate-900">Adjust area-based price range</h3>
                        <p className="text-[13px] text-slate-500">Raw values are preserved in URL, modified values are used for matching.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-[13px] font-bold text-slate-600">Minimum price</label>
                            <input
                                type="number"
                                min="0"
                                value={priceMin}
                                onChange={(e) => setPriceMin(e.target.value)}
                                placeholder="0"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 outline-none transition-colors focus:border-[color:var(--color-primary)]"
                            />
                            {priceMin && (
                                <div className="flex items-center gap-1.5 px-1 text-[12px] text-slate-400">
                                    <span className="font-medium text-slate-500">{formatDevanagariComma(priceMin)}</span>
                                    {toNepaliWords(priceMin) && <><span>·</span><span>{toNepaliWords(priceMin)}</span></>}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[13px] font-bold text-slate-600">Maximum price</label>
                            <input
                                type="number"
                                min="0"
                                value={priceMax}
                                onChange={(e) => setPriceMax(e.target.value)}
                                placeholder="Any"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 outline-none transition-colors focus:border-[color:var(--color-primary)]"
                            />
                            {priceMax && (
                                <div className="flex items-center gap-1.5 px-1 text-[12px] text-slate-400">
                                    <span className="font-medium text-slate-500">{formatDevanagariComma(priceMax)}</span>
                                    {toNepaliWords(priceMax) && <><span>·</span><span>{toNepaliWords(priceMax)}</span></>}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {HOME_PRICE_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                    setPriceMin(preset.min);
                                    setPriceMax(preset.max);
                                }}
                                className="rounded-full border border-[color:var(--color-primary)]/12 bg-[color:var(--color-primary)]/4 px-4 py-2 text-[13px] font-bold text-slate-700 transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div className="text-[13px] font-bold text-slate-600">Unit</div>
                        <div className="flex gap-2">
                            {([['peraana', 'per aana'], ['persqm', 'per m²']] as [AreaPriceUnit, string][]).map(([val, lbl]) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setAreaPriceUnit(val)}
                                    className={`rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 ${areaPriceUnit === val ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-[0_6px_16px_rgba(10,107,255,0.2)]' : 'border-slate-200 bg-white text-slate-700 hover:border-[color:var(--color-primary)]/40'}`}
                                >
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (panel === 'location') {
            return (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-[15px] font-black text-slate-900">Select one or more locations</h3>
                        <p className="text-[13px] text-slate-500">Choose the areas you want to search in.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedLocations.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSelectedLocations([])}
                                className="rounded-full border border-[color:var(--color-primary)]/12 bg-[color:var(--color-primary)]/4 px-4 py-2 text-[13px] font-bold text-slate-600 transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                            >
                                Clear all
                            </button>
                        )}
                        {selectedLocations.map((location) => (
                            <span key={location} className="rounded-full bg-[color:var(--color-primary)]/10 px-4 py-2 text-[13px] font-bold text-[color:var(--color-primary)]">
                                {location}
                            </span>
                        ))}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {HOME_LOCATION_OPTIONS.map((location) => {
                            const isSelected = selectedLocations.includes(location);

                            return (
                                <button
                                    key={location}
                                    type="button"
                                    onClick={() => toggleLocation(location)}
                                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-[13px] font-bold transition-all duration-200 ${isSelected ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/6 text-[color:var(--color-primary)]' : 'border-[color:var(--color-primary)]/12 bg-white text-slate-700 hover:border-[color:var(--color-primary)]/35'}`}
                                >
                                    <span>{location}</span>
                                    <span className={`h-5 w-5 rounded-full border ${isSelected ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]' : 'border-slate-300 bg-white'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (panel === 'size') {
            return (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-[15px] font-black text-slate-900">Set area range</h3>
                        <p className="text-[13px] text-slate-500">Filter by built-up area from one value to another.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                        <label className="space-y-2 text-[13px] font-bold text-slate-600">
                            Minimum area
                            <input
                                type="number"
                                min="0"
                                value={sizeMin}
                                onChange={(e) => setSizeMin(e.target.value)}
                                placeholder="0"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 outline-none transition-colors focus:border-[color:var(--color-primary)]"
                            />
                        </label>
                        <label className="space-y-2 text-[13px] font-bold text-slate-600">
                            Maximum area
                            <input
                                type="number"
                                min="0"
                                value={sizeMax}
                                onChange={(e) => setSizeMax(e.target.value)}
                                placeholder="Any"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 outline-none transition-colors focus:border-[color:var(--color-primary)]"
                            />
                        </label>
                        <label className="space-y-2 text-[13px] font-bold text-slate-600">
                            Unit
                            <select
                                value={sizeUnit}
                                onChange={(e) => setSizeUnit(e.target.value as 'm2' | 'sqft')}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 outline-none transition-colors focus:border-[color:var(--color-primary)]"
                            >
                                <option value="m2">m²</option>
                                <option value="sqft">sq.ft.</option>
                            </select>
                        </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {HOME_SIZE_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                    setSizeMin(preset.min);
                                    setSizeMax(preset.max);
                                }}
                                className="rounded-full border border-[color:var(--color-primary)]/12 bg-[color:var(--color-primary)]/4 px-4 py-2 text-[13px] font-bold text-slate-700 transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-[15px] font-black text-slate-900">Listed by</h3>
                        <p className="text-[13px] text-slate-500">Choose the seller type you want to see.</p>
                    </div>
                    {selectedListedBy && (
                        <button
                            type="button"
                            onClick={() => setSelectedListedBy(null)}
                            className="rounded-full border border-[color:var(--color-primary)]/12 bg-[color:var(--color-primary)]/4 px-4 py-2 text-[12px] font-bold text-slate-600 transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {HOME_LISTED_BY_OPTIONS.map((option) => {
                        const isSelected = selectedListedBy === option;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setSelectedListedBy(isSelected ? null : option)}
                                className={`rounded-full border px-4 py-2.5 text-[13px] font-bold capitalize transition-all duration-200 ${isSelected ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-[0_14px_30px_rgba(10,107,255,0.18)]' : 'border-[color:var(--color-primary)]/12 bg-white text-slate-700 hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]'}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <section className="text-slate-900 py-2 sm:py-10">
            <div className="space-y-3 sm:space-y-6">
                <div className="max-w-4xl space-y-2 sm:space-y-3">
                    <h1 className="text-xl font-black leading-[1.08] sm:text-4xl lg:text-5xl">
                        Find the property of your choice.
                    </h1>
                    <p className="max-w-3xl text-sm font-medium text-slate-600 sm:text-xl">
                        The #1 property portal of Nepal.
                    </p>
                </div>

                <div className="space-y-2.5 sm:space-y-4">
                    <div className="grid gap-2 sm:gap-3">
                        <div className="flex items-center gap-2.5 rounded-[18px] border border-[color:var(--color-primary)]/25 bg-white px-2.5 py-2.5 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:gap-3 sm:rounded-[24px] sm:px-4 sm:py-4">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[color:var(--color-primary)] sm:h-[22px] sm:w-[22px]">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        submitSearch();
                                    }
                                }}
                                placeholder="Search by property, area, landmark, or developer"
                                className="w-full bg-transparent text-[14px] font-semibold text-slate-900 outline-none placeholder:text-slate-400 sm:text-[15px]"
                            />
                            <button
                                type="button"
                                onClick={submitSearch}
                                title="Search properties"
                                aria-label="Search properties"
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white shadow-[0_12px_24px_rgba(10,107,255,0.28)] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] sm:h-10 sm:w-10"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Compact filter pills */}
                    <div className="flex flex-wrap gap-2">
                        {([
                            ['price', 'Price', currentPriceLabel],
                            ['location', 'Location', currentLocationLabel],
                            ['size', 'Size', currentSizeLabel],
                            ['listedBy', 'Listed by', currentListedByLabel],
                        ] as Array<[Exclude<HomeSearchPanel, null>, string, string]>).map(([key, label, value]) => {
                            const isActive = activePanel === key;
                            const hasValue = value !== 'Any budget' && value !== 'Any location' && value !== 'Any size' && value !== 'Any seller';
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => openModal(key)}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-left text-[13px] font-semibold transition-all duration-150 ${hasValue ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/6 text-[color:var(--color-primary)]' : 'border-slate-200 bg-white text-slate-700 hover:border-[color:var(--color-primary)]/40 hover:text-slate-900'}`}
                                >
                                    <span className="text-[13px] font-medium text-slate-500">{label}:</span>
                                    <span className="truncate max-w-[120px]">{value}</span>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-50">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filter modal */}
            {activePanel && (
                <div
                    className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-200 ${isModalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={closeModal}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />

                    {/* Modal panel */}
                    <div
                        className={`relative z-10 w-full max-w-lg mx-4 mb-4 sm:mb-0 rounded-[28px] border border-[color:var(--color-primary)]/12 bg-white text-slate-900 shadow-[0_32px_80px_rgba(15,23,42,0.18)] transition-all duration-200 ease-out ${isModalVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-[0.97] opacity-0'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <span className="text-[15px] font-black text-slate-900">
                                {activePanel === 'price' && 'Price'}
                                {activePanel === 'location' && 'Location'}
                                {activePanel === 'size' && 'Size'}
                                {activePanel === 'listedBy' && 'Listed by'}
                            </span>
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Close"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal content */}
                        <div className="p-5">
                            {renderPanelContent(activePanel)}
                        </div>

                        {/* Modal footer */}
                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-bold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-full bg-[color:var(--color-primary)] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(10,107,255,0.22)] transition-all hover:opacity-90"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

type SiteSettings = {
    show_featured_properties?: boolean;
    show_sponsored_deals?: boolean;
    show_property_collection?: boolean;
    show_explore_categories?: boolean;
    show_hero_carousel_ad?: boolean;
    show_feed_ad?: boolean;
    [key: string]: any;
};

type HomeClientProps = {
    user: any;
    featuredCollections?: any[];
    trendingSearches?: string[];
    featuredProperties?: any[];
    featuredAgencies?: any[];
    advertisements?: any[];
    categories?: any[];
    siteSettings?: SiteSettings | null;
    exploreCategoryStats?: {
        forSale: {
            house: number;
            land: number;
            building: number;
        };
        forRent: {
            flat: number;
            house: number;
            apartment: number;
            totalRent: number;
        };
        requirements: {
            total: number;
            rental: number;
            purchase: number;
        };
    };
};

function PostPropertySection() {
    const cards = [
        {
            key: 'property',
            title: 'Post Property',
            icon: '🏠',
            actions: [
                { label: 'Sell your Property', href: '/sell?purpose=sale' },
                { label: 'Give on rent', href: '/sell?purpose=rent' },
            ],
        },
        {
            key: 'requirement',
            title: 'Post Requirement',
            icon: '🔍',
            actions: [
                { label: 'Looking to buy', href: '/requirements/new?purpose=sale' },
                { label: 'Looking to rent', href: '/requirements/new?purpose=rent' },
            ],
        },
    ];

    return (
        <section className="w-full">
            <div className="mb-5 space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Post Property or Requirement</h2>
                <p className="text-sm text-slate-500">List your property for sale or rent, or post what you&apos;re looking for.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {cards.map((card) => (
                    <div
                        key={card.key}
                        className="flex items-center justify-between gap-4 rounded-[22px] border border-[color:var(--color-primary)]/12 bg-white px-4 py-4 sm:px-5 transition-all duration-200 hover:border-[color:var(--color-primary)]/30"
                    >
                        <div className="flex flex-col gap-2.5 min-w-0">
                            <div className="text-[14px] sm:text-[15px] font-bold text-slate-900">{card.title}</div>
                            <div className="flex flex-wrap gap-2">
                                {card.actions.map((action) => (
                                    <Link
                                        key={action.href}
                                        href={action.href}
                                        className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] sm:text-[13px] font-semibold text-slate-700 transition-colors hover:bg-[color:var(--color-primary)]/10 hover:text-[color:var(--color-primary)]"
                                    >
                                        {action.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <span className="text-2xl sm:text-3xl shrink-0">{card.icon}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function StatCard({ emoji, label, count, href }: { emoji: string; label: string; count: number; href: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-[18px] border border-[color:var(--color-primary)]/12 bg-white px-3 py-3 transition-all duration-200 hover:border-[color:var(--color-primary)]/35 hover:shadow-sm sm:px-4 w-[calc(50%-4px)] sm:w-[calc(25%-6px)]"
        >
            <span className="text-xl leading-none">{emoji}</span>
            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 truncate">{label}</div>
                <div className="text-[15px] font-black text-[color:var(--color-primary)] mt-0.5">{count}</div>
            </div>
        </Link>
    );
}

function ExploreCategoriesSection({
    stats,
}: {
    stats: NonNullable<HomeClientProps['exploreCategoryStats']>;
}) {
    return (
        <section className="w-full space-y-4">
            <div className="mb-5 space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Available Listings</h2>
                <p className="text-sm text-slate-500">Browse properties by type and purpose.</p>
            </div>
            <div className="space-y-2">
                <div className="px-1 text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">For Sale</div>
                <div className="flex flex-wrap gap-2">
                    <StatCard emoji="🏠" label="House" count={stats.forSale.house} href="/explore?type=feed&purposes=sale&types=house" />
                    <StatCard emoji="🌿" label="Land" count={stats.forSale.land} href="/explore?type=feed&purposes=sale&types=land" />
                    <StatCard emoji="🏢" label="Building" count={stats.forSale.building} href="/explore?type=feed&purposes=sale&types=building" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="px-1 text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">For Rent</div>
                <div className="flex flex-wrap gap-2">
                    <StatCard emoji="🛋️" label="Flat" count={stats.forRent.flat} href="/explore?type=feed&purposes=rent&types=flat" />
                    <StatCard emoji="🏡" label="House" count={stats.forRent.house} href="/explore?type=feed&purposes=rent&types=house" />
                    <StatCard emoji="🏙️" label="Apartment" count={stats.forRent.apartment} href="/explore?type=feed&purposes=rent&types=apartment" />
                    <StatCard emoji="🔑" label="All Rent" count={stats.forRent.totalRent} href="/explore?type=feed&purposes=rent" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="px-1 text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Requirements</div>
                <div className="flex flex-wrap gap-2">
                    <StatCard emoji="🏘️" label="Rental" count={stats.requirements.rental} href="/requirements?purpose=rent" />
                    <StatCard emoji="💼" label="Purchase" count={stats.requirements.purchase} href="/requirements?purpose=sale" />
                </div>
            </div>
        </section>
    );
}

export default function HomeClient({ user, featuredCollections, trendingSearches, featuredProperties = [], advertisements = [], exploreCategoryStats, siteSettings }: HomeClientProps) {
    const [isLoading, setIsLoading] = useState(true);

    const [properties, setProperties] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const featuredCards = resolveFeaturedCards(featuredProperties);

    // Derived ads data - all active ads can appear in both carousel and feed
    const activeAds = advertisements.filter((ad: any) => ad.status === 'active').map((ad: any) => ({
        ...ad,
        posted_by: ad.posted_by || ad.title // Ensure posted_by is available for the carousel UI
    }));

    const carouselAds = activeAds;
    const feedAds = activeAds;

    const fetchProperties = async (reset = false) => {
        if (!reset && (!hasMore || isFetchingMore)) return;

        if (reset) {
            if (properties.length === 0) setIsLoading(true);
            setPage(0);
            setHasMore(true);
        } else {
            setIsFetchingMore(true);
        }

        try {
            const currentSkip = reset ? 0 : (page + 1) * 10;
            const res = await fetch(`/api/properties?skip=${currentSkip}&take=10`);
            const data = await res.json();

            if (Array.isArray(data)) {
                if (data.length < 10) setHasMore(false);

                if (reset) {
                    setProperties(data);
                    setPage(0);
                } else {
                    setProperties(prev => [...prev, ...data]);
                    setPage(prev => prev + 1);
                }
            }
        } catch (err) {
            console.error("Failed to load properties:", err);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchProperties(true);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Check if the page is loading content */}
            {isLoading ? (
                <FeedSkeleton hasCarouselAds={carouselAds.length > 0} />
            ) : (
                <div className="w-full">
                    <div className="mx-auto w-full max-w-[1400px] px-2 pt-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                        <HomeSearchHero />

                        {exploreCategoryStats && siteSettings?.show_explore_categories !== false && (
                            <ExploreCategoriesSection stats={exploreCategoryStats} />
                        )}

                        <div>
                            <PostPropertySection />
                        </div>
                    </div>

                    {/* Hero Carousel Ad */}
                    {siteSettings?.show_hero_carousel_ad !== false && carouselAds.length > 0 && (
                        <div className="w-full mx-auto max-w-[1400px] px-2 sm:px-6 lg:px-8 mt-8 sm:mt-12">
                            <div className="mb-5 space-y-1">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">Sponsored Deals</h2>
                                <p className="text-sm text-slate-500">Promoted listings from verified partners and agencies.</p>
                            </div>
                            <HeroCarouselAd ads={carouselAds} />
                        </div>
                    )}

                    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 sm:gap-12 px-2 sm:px-6 lg:px-8 mt-8 sm:mt-12">
                        {/* Featured Properties Section (eSewa Style) */}
                        {siteSettings?.show_featured_properties !== false && featuredCards.length > 0 && (
                            <section className="w-full">
                                <SectionTitleFeed
                                    title="Featured Properties"
                                    description="Curated listings with complete details and verified media."
                                    ctaText="View more"
                                    ctaHref="/explore"
                                />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {featuredCards.slice(0, 4).map((prop: any) => (
                                        <FeaturedSmallCard key={prop.id} property={prop} />
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="w-full">
                            {/* Feed Content Area - Full Width */}
                            <div className="flex flex-col gap-10">
                                <div className="space-y-6">
                                    {/* Sub-header for the feed */}
                                    <SectionTitleFeed
                                        title="Latest Property/Requirements"
                                        description="Real-time stream of premium listings, sponsored placements, and curated discovery signals."
                                    />

                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-6">
                                            {(() => {
                                                const feedItems: any[] = [];
                                                let propertyIndex = 0;
                                                let insertionCount = 0;

                                                const availableCardTypes = ['featured_collections', 'trending_searches', 'featured_projects'];
                                                const validCardTypes = availableCardTypes.filter(type => {
                                                    if (type === 'featured_collections') return siteSettings?.show_property_collection !== false && featuredCollections && featuredCollections.length > 0;
                                                    if (type === 'trending_searches') return trendingSearches && trendingSearches.length > 0;
                                                    if (type === 'featured_projects') return siteSettings?.show_featured_properties !== false && featuredProperties && featuredProperties.length > 0;
                                                    return false;
                                                });

                                                const addAd = (seedIndex: number) => {
                                                    if (feedAds.length === 0) return;
                                                    const adIndex = seedIndex % feedAds.length;
                                                    feedItems.push({ type: 'ad', data: feedAds[adIndex] });
                                                };

                                                while (propertyIndex < properties.length) {
                                                    const chunkCount = Math.min(4, properties.length - propertyIndex);
                                                    const propertySet: any[] = [];

                                                    for (let i = 0; i < chunkCount; i++) {
                                                        propertySet.push(properties[propertyIndex++]);
                                                    }

                                                    if (propertySet.length > 0) {
                                                        feedItems.push({ type: 'property_set', data: propertySet });
                                                    }

                                                    if (chunkCount > 0) {
                                                        addAd(insertionCount);
                                                        if (validCardTypes.length > 0) {
                                                            const cardType = validCardTypes[insertionCount % validCardTypes.length];
                                                            feedItems.push({ type: cardType });
                                                        }
                                                        insertionCount++;
                                                    }
                                                }

                                                // Merge consecutive property_sets that have no visible
                                                // content between them (ads disabled = null render,
                                                // or simply nothing in between).
                                                const isVisibleItem = (item: any) => {
                                                    if (item.type === 'ad') return siteSettings?.show_feed_ad !== false && feedAds.length > 0;
                                                    return true;
                                                };

                                                const mergedItems: any[] = [];
                                                for (let i = 0; i < feedItems.length; i++) {
                                                    const item = feedItems[i];
                                                    if (item.type !== 'property_set') {
                                                        mergedItems.push(item);
                                                        continue;
                                                    }
                                                    // Accumulate this set and any following sets that
                                                    // have no visible non-property items between them.
                                                    const merged = { type: 'property_set', data: [...item.data] };
                                                    while (i + 1 < feedItems.length) {
                                                        // Peek ahead: skip invisible items, stop at visible non-property items
                                                        let j = i + 1;
                                                        let hasVisibleGap = false;
                                                        while (j < feedItems.length && feedItems[j].type !== 'property_set') {
                                                            if (isVisibleItem(feedItems[j])) {
                                                                hasVisibleGap = true;
                                                                break;
                                                            }
                                                            j++;
                                                        }
                                                        if (hasVisibleGap || j >= feedItems.length || feedItems[j].type !== 'property_set') break;
                                                        // No visible gap — absorb the next property_set
                                                        merged.data.push(...feedItems[j].data);
                                                        i = j;
                                                    }
                                                    mergedItems.push(merged);
                                                }

                                                const triggerPropertyId = properties.length >= 5 ? properties[properties.length - 5]?.id : undefined;

                                                return mergedItems.map((item, idx) => {
                                                    let component = null;

                                                    if (item.type === 'property_set') {
                                                        component = (
                                                            <div className="rounded-[28px] border border-slate-300 bg-white shadow-[var(--shadow-card)] overflow-hidden">
                                                                {item.data.map((property: any, propertyIndexInSet: number) => {
                                                                    const isTrigger = property.id === triggerPropertyId;
                                                                    const isFirstInSet = propertyIndexInSet === 0;
                                                                    const isLastInSet = propertyIndexInSet === item.data.length - 1;

                                                                    return (
                                                                        <PropertyPost
                                                                            key={property.id || `${idx}-${propertyIndexInSet}`}
                                                                            property={property}
                                                                            onVisible={isTrigger ? () => fetchProperties(false) : undefined}
                                                                            isFirstInSet={isFirstInSet}
                                                                            isLastInSet={isLastInSet}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    } else if (item.type === 'ad') {
                                                        component = siteSettings?.show_feed_ad !== false ? <FeedAd ad={item.data} /> : null;
                                                    } else if (item.type === 'featured_collections') {
                                                        component = <FeaturedCollectionsFeedItem collections={featuredCollections || []} />;
                                                    } else if (item.type === 'trending_searches') {
                                                        component = <TrendingSearches searches={trendingSearches || []} />;
                                                    } else if (item.type === 'featured_projects') {
                                                        component = <FeaturedProjects properties={featuredProperties || []} />;
                                                    }

                                                    return (
                                                        <div key={`${item.type}-${idx}`} className={`w-full animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                                                            {component}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>

                                    {isFetchingMore && (
                                        <div className="text-center py-12 text-text-muted font-bold animate-pulse flex flex-col items-center justify-center gap-4">
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                            </div>
                                            <span className="text-[13px] uppercase tracking-[0.2em] opacity-60">Discovering more premium assets</span>
                                        </div>
                                    )}

                                    {!hasMore && properties.length > 0 && (
                                        <div className="text-center py-20 border-t border-border/60">
                                            <div className="inline-block p-4 rounded-full bg-surface border border-border mb-4">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted opacity-40"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                            </div>
                                            <p className="text-text-muted text-[15px] font-black tracking-tight">
                                                You&apos;ve reached the end of the registry.
                                            </p>
                                            <p className="text-text-muted/60 text-[12px] font-medium mt-1">
                                                Check back later for new opportunities.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}

function FeedSkeleton({ hasCarouselAds = true }: { hasCarouselAds?: boolean }) {
    return (
        <div className="w-full flex flex-col">
            <div className="mx-auto w-full max-w-[1400px] px-2 pt-3 sm:px-6 lg:px-8">
                <div className="h-[320px] rounded-[36px] bg-surface animate-pulse mb-6" />
            </div>

            {/* Carousel Skeleton - Full Width */}
            {hasCarouselAds && (
                <div className="h-[400px] w-full bg-surface animate-pulse mb-8"></div>
            )}
            
            <div className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8">
                {/* Featured Properties Skeleton */}
                <div className="w-full flex flex-col gap-6 mb-16">
                    <div className="h-6 w-1/4 bg-surface rounded animate-pulse"></div>
                    <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="aspect-square bg-surface animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                </div>

                {/* Feed Area Skeleton */}
                <div className="w-full mt-12 flex flex-col gap-10">
                    {/* Property Feed Skeleton */}
                    <div className="w-full flex flex-col">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="py-4 border-b border-slate-100 last:border-0 flex gap-4">
                                {/* Left: Image Section Skeleton */}
                                <div className="w-[120px] sm:w-[160px] flex-shrink-0 flex flex-col gap-2">
                                    <div className="aspect-square bg-slate-100 animate-pulse rounded-lg"></div>
                                    <div className="flex gap-1 overflow-hidden">
                                        {[1, 2, 3].map(j => (
                                            <div key={j} className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-slate-100 animate-pulse flex-shrink-0"></div>
                                        ))}
                                    </div>
                                </div>
                                {/* Right: Content Section Skeleton */}
                                <div className="flex-1 flex flex-col gap-2 py-1">
                                    {/* Seller Name Skeleton at Top */}
                                    <div className="h-3 w-32 bg-slate-100 animate-pulse rounded mb-1"></div>
                                    
                                    <div className="flex justify-between items-start">
                                        <div className="h-5 w-3/4 bg-slate-100 animate-pulse rounded"></div>
                                        <div className="h-5 w-5 bg-slate-100 animate-pulse rounded"></div>
                                    </div>
                                    <div className="h-4 w-full bg-slate-100 animate-pulse rounded mt-1"></div>
                                    <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded"></div>
                                    <div className="flex gap-2 items-center mt-2">
                                        <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-full"></div>
                                        <div className="h-4 w-16 bg-slate-100 animate-pulse rounded-full"></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div>
                                        <div className="h-4 w-12 bg-slate-100 animate-pulse rounded"></div>
                                    </div>
                                    <div className="flex justify-end items-center mt-auto">
                                        <div className="w-6 h-6 bg-slate-100 animate-pulse rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
