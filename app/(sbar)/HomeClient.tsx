"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FeaturedProjects } from '@/components/cards/FeaturedProjects';
import { TrendingSearches } from '@/components/cards/TrendingSearches';
import { HeroCarouselAd, FeedAd } from '@/components/cards/AdvertisementCard';
import { SectionTitleFeed } from '@/components/sections/SectionTitleFeed';
import { PropertyPost } from '@/components/cards/PropertyFeedCard';
import { formatNPR } from '@/lib/formatters';
import { setBackgroundScrollLocked, setPopupActive } from '@/lib/ui/popup-visibility';

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

function splitQueryValues(value: string | null | undefined): string[] {
    if (!value) return [];
    return value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

function normalizeQueryList(values: Array<string | null | undefined>): string[] {
    return values
        .flatMap((item) => splitQueryValues(item))
        .filter(Boolean);
}

function collectNamedValues(items: any[] | undefined, key = 'name'): string[] {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => (typeof item === 'string' ? item : item?.[key]))
        .filter(Boolean)
        .map((item) => String(item).trim().toLowerCase());
}

function includesAny(source: string[], filters: string[]): boolean {
    if (filters.length === 0) return true;
    return filters.some((filter) => source.includes(filter));
}

function matchesLocationParts(parts: Array<string | null | undefined>, filters: string[]): boolean {
    if (filters.length === 0) return true;
    const values = parts
        .filter(Boolean)
        .map((item) => String(item).trim().toLowerCase());
    return filters.some((filter) => values.some((value) => value.includes(filter) || filter.includes(value)));
}

function matchesPriceRange(value: number | null | undefined, minPrice?: number | null, maxPrice?: number | null): boolean {
    if (minPrice == null && maxPrice == null) return true;
    if (value == null) return true;
    if (minPrice != null && value < minPrice) return false;
    if (maxPrice != null && value > maxPrice) return false;
    return true;
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

type HomeSearchPanel = 'type' | 'price' | 'location' | 'size' | 'listedBy' | 'category' | null;
type CategoryType = 'residential' | 'commercial' | 'semi-commercial';
type ListedByType = 'owner' | 'agent' | 'agency';
type AreaPriceUnit = 'peraana' | 'persqm';
type PropertyTypeOption = 'house' | 'land' | 'apartment' | 'business' | 'flat' | 'commercial space' | 'office space';

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

const HOME_PRICE_PRESETS_SALE = [
    { label: 'Any budget', min: '', max: '' },
    { label: 'Under 50 Lakh', min: '0', max: '5000000' },
    { label: '50L – 1 Crore', min: '5000000', max: '10000000' },
    { label: '1 – 3 Crore', min: '10000000', max: '30000000' },
    { label: 'Above 3 Crore', min: '30000000', max: '' },
];

const HOME_PRICE_PRESETS_RENT = [
    { label: 'Any budget', min: '', max: '' },
    { label: 'Under 20k', min: '0', max: '20000' },
    { label: '20k – 40k', min: '20000', max: '40000' },
    { label: '40k – 60k', min: '40000', max: '60000' },
    { label: 'Above 60k', min: '60000', max: '' },
];

const HOME_SIZE_PRESETS = [
    { label: 'Any size', min: '', max: '' },
    { label: 'Under 500 m²', min: '0', max: '500' },
    { label: '500 - 2,000 m²', min: '500', max: '2000' },
    { label: 'Above 2,000 m²', min: '2000', max: '' },
];

const HOME_LISTED_BY_OPTIONS: Array<{ value: ListedByType; label: string }> = [
    { value: 'owner', label: 'owners' },
    { value: 'agent', label: 'agents' },
    { value: 'agency', label: 'agency' },
];
const HOME_PROPERTY_TYPE_OPTIONS_SALE: PropertyTypeOption[] = ['house', 'land', 'apartment', 'business'];
const HOME_PROPERTY_TYPE_OPTIONS_RENT: PropertyTypeOption[] = ['flat', 'house', 'apartment', 'commercial space', 'office space'];

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
    if (digits.length <= 3) return digits;
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return `${grouped},${last3}`;
}

/** Convert a raw number string to Nepali word form using Devanagari terms */
function toNepaliWords(value: string): string {
    const n = Number(value.replace(/\D/g, ''));
    if (!n || Number.isNaN(n)) return '';
    const crore = 1_00_00_000;
    const lakh = 1_00_000;
    const thousand = 1_000;
    const parts: string[] = [];
    let rem = n;
    if (rem >= crore)    { parts.push(`${Math.floor(rem / crore)} Crore`);    rem %= crore; }
    if (rem >= lakh)     { parts.push(`${Math.floor(rem / lakh)} Lakh`);      rem %= lakh; }
    if (rem >= thousand) { parts.push(`${Math.floor(rem / thousand)} Thousand`); rem %= thousand; }
    // 100–999: just show the number as-is, no "hundred" label
    if (parts.length === 0 && n > 0) return String(n);
    return parts.join(' ');
}

function formatNumberShort(n: number): string {
    if (!Number.isFinite(n)) return '';
    const crore = 1_00_00_000;
    const lakh = 1_00_000;
    const thousand = 1000;

    const parts: string[] = [];
    if (n >= crore) {
        const cr = Math.floor(n / crore);
        parts.push(`${cr} Cr`);
        n = n % crore;
    }
    if (n >= lakh) {
        const lk = Math.floor(n / lakh);
        parts.push(`${lk} L`);
        n = n % lakh;
    }
    if (parts.length === 0 && n >= thousand) {
        parts.push(`${Math.floor(n / thousand)}k`);
    }

    return parts.join(' ') || String(n);
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

function formatTimeAgo(input: string | Date) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return '';

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';

    const units = [
        { label: 'y', value: 60 * 60 * 24 * 365 },
        { label: 'mo', value: 60 * 60 * 24 * 30 },
        { label: 'd', value: 60 * 60 * 24 },
        { label: 'h', value: 60 * 60 },
        { label: 'm', value: 60 },
    ];

    for (const unit of units) {
        const count = Math.floor(seconds / unit.value);
        if (count >= 1) return `${count}${unit.label} ago`;
    }

    return 'just now';
}

function PhoneIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}

function WhatsAppIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
    );
}

function ShareIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    );
}

function HomeSearchHero() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [purposes, setPurposes] = useState<Set<'sale' | 'rent'>>(new Set(['sale']));
    const [activePanel, setActivePanel] = useState<HomeSearchPanel>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [areaPriceUnit, setAreaPriceUnit] = useState<AreaPriceUnit>('peraana');
    const [selectedListedBy, setSelectedListedBy] = useState<ListedByType | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
    const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyTypeOption | null>(null);
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

    useEffect(() => {
        setPopupActive('home-search-filter-modal', Boolean(activePanel));
        setBackgroundScrollLocked('home-search-filter-modal', Boolean(activePanel));
        return () => {
            setPopupActive('home-search-filter-modal', false);
            setBackgroundScrollLocked('home-search-filter-modal', false);
        };
    }, [activePanel]);

    const currentPriceLabel = priceMin || priceMax
        ? `${priceMin ? formatDevanagariComma(priceMin) : 'Any'} - ${priceMax ? formatDevanagariComma(priceMax) : 'Any'}${(purposes.has('rent') && !purposes.has('sale')) ? '/mo' : ` (${areaPriceUnit === 'peraana' ? 'per aana' : 'per m²'})`}`
        : 'Any budget';

    const currentPriceLabelShort = (() => {
        if (!priceMin && !priceMax) return 'Any budget';
        const minNum = priceMin ? Number(String(priceMin).replace(/[^\d]/g, '')) : null;
        const maxNum = priceMax ? Number(String(priceMax).replace(/[^\d]/g, '')) : null;

        if (minNum && maxNum) return `${formatNumberShort(minNum)} - ${formatNumberShort(maxNum)}`;
        if (maxNum) return `Up to ${formatNumberShort(maxNum)}`;
        if (minNum) return `From ${formatNumberShort(minNum)}`;
        return 'Any budget';
    })();

    const currentLocationLabel = selectedLocations.length > 0
        ? `${selectedLocations.length} selected`
        : 'Any location';

    const currentSizeLabel = sizeMin || sizeMax
        ? `${sizeMin || 'Any'} - ${sizeMax || 'Any'} ${sizeUnit === 'm2' ? 'm²' : 'sq.ft.'}`
        : 'Any size';

    const currentCategoryLabel = selectedCategory
        ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
        : 'Any category';
    const currentListedByLabel = selectedListedBy
        ? `${selectedListedBy.charAt(0).toUpperCase() + selectedListedBy.slice(1)}${selectedListedBy === 'agency' ? '' : 's'}`
        : 'Any posted by';
    const currentTypeLabel = selectedPropertyType
        ? selectedPropertyType.charAt(0).toUpperCase() + selectedPropertyType.slice(1)
        : 'Any type';

    const HOME_PRICE_PRESETS = purposes.has('rent') && !purposes.has('sale') ? HOME_PRICE_PRESETS_RENT : HOME_PRICE_PRESETS_SALE;
    const HOME_PROPERTY_TYPE_OPTIONS = purposes.has('rent') && !purposes.has('sale')
        ? HOME_PROPERTY_TYPE_OPTIONS_RENT
        : HOME_PROPERTY_TYPE_OPTIONS_SALE;

    const buildSearchParams = (options?: { view?: 'map' }) => {
        const params = new URLSearchParams();
        const modified = convertAreaPriceToModified(areaPriceUnit, priceMin, priceMax);

        if (query.trim()) params.set('rawQuery', query.trim());
        params.set('purposes', Array.from(purposes).join(','));
        if (selectedPropertyType) params.set('types', selectedPropertyType);
        if (selectedListedBy) params.set('listedBy', selectedListedBy);
        if (selectedCategory) params.set('category', selectedCategory);
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
        if (options?.view) params.set('view', options.view);

        return params;
    };

    const submitSearch = () => {
        const params = buildSearchParams();
        router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const submitMapSearch = () => {
        const params = buildSearchParams({ view: 'map' });
        router.push(`/maps${params.toString() ? `?${params.toString()}` : ''}`);
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
                                <div className="px-1 text-[12px] text-slate-400">
                                    {toNepaliWords(priceMin)}
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
                                <div className="px-1 text-[12px] text-slate-400">
                                    {toNepaliWords(priceMax)}
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
                    {(purposes.has('sale') || purposes.size === 0) && (
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
                    )}
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
                    <div className="max-h-[46vh] overflow-y-auto pr-1">
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

        if (panel === 'type') {
            return (
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-[15px] font-black text-slate-900">Type</h3>
                            <p className="text-[13px] text-slate-500">Choose the property type for this purpose.</p>
                        </div>
                        {selectedPropertyType && (
                            <button
                                type="button"
                                onClick={() => setSelectedPropertyType(null)}
                                className="rounded-full border border-[color:var(--color-primary)]/12 bg-[color:var(--color-primary)]/4 px-4 py-2 text-[12px] font-bold text-slate-600 transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {HOME_PROPERTY_TYPE_OPTIONS.map((option) => {
                            const isSelected = selectedPropertyType === option;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setSelectedPropertyType(isSelected ? null : option)}
                                    className={`rounded-full border px-4 py-2.5 text-[13px] font-bold capitalize transition-all duration-200 ${isSelected ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-[0_14px_30px_rgba(10,107,255,0.18)]' : 'border-[color:var(--color-primary)]/12 bg-white text-slate-700 hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]'}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (panel === 'listedBy') {
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
                            const isSelected = selectedListedBy === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelectedListedBy(isSelected ? null : option.value)}
                                    className={`rounded-full border px-4 py-2.5 text-[13px] font-bold capitalize transition-all duration-200 ${isSelected ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-[0_14px_30px_rgba(10,107,255,0.18)]' : 'border-[color:var(--color-primary)]/12 bg-white text-slate-700 hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]'}`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (panel === 'category') {
            return (
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-[15px] font-black text-slate-900">Category</h3>
                            <p className="text-[13px] text-slate-500">Filter by property category.</p>
                        </div>
                        {selectedCategory && (
                            <button
                                type="button"
                                onClick={() => setSelectedCategory(null)}
                                className="rounded-full border border-[color:var(--color-primary)]/12 bg-[color:var(--color-primary)]/4 px-4 py-2 text-[12px] font-bold text-slate-600 transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {(['residential', 'commercial', 'semi-commercial'] as CategoryType[]).map((option) => {
                            const isSelected = selectedCategory === option;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setSelectedCategory(isSelected ? null : option)}
                                    className={`rounded-full border px-4 py-2.5 text-[13px] font-bold capitalize transition-all duration-200 ${isSelected ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-[0_14px_30px_rgba(10,107,255,0.18)]' : 'border-[color:var(--color-primary)]/12 bg-white text-slate-700 hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]'}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <section className="text-slate-900 py-0 sm:py-2">
            <div className="space-y-3 sm:space-y-5">
                <div className="max-w-4xl space-y-1 sm:space-y-2">
                    <h1 className="text-lg font-bold leading-snug sm:text-3xl lg:text-4xl">
                        Find the property of your choice.
                    </h1>
                    <p className="max-w-3xl text-sm font-normal text-slate-500 sm:text-base">
                        The #1 property portal of Nepal.
                    </p>
                </div>

                <div className="space-y-1.5">
                    {/* Purpose pills */}
                    <div className="w-full max-w-[1100px]">
                        <div className="inline-flex overflow-hidden rounded-t-[14px] border border-b-0 border-slate-200 bg-white">
                            {([['sale', 'For Sale'], ['rent', 'For Rent']] as ['sale' | 'rent', string][]).map(([val, lbl], index, arr) => {
                                const isActive = purposes.has(val);
                                const togglePurpose = () => {
                                    setPurposes(new Set([val]));
                                    setPriceMin(''); setPriceMax('');
                                    setSelectedPropertyType((prev) => {
                                        if (!prev) return prev;
                                        const nextOptions = val === 'rent' ? HOME_PROPERTY_TYPE_OPTIONS_RENT : HOME_PROPERTY_TYPE_OPTIONS_SALE;
                                        return nextOptions.includes(prev) ? prev : null;
                                    });
                                };
                                const isLast = index === arr.length - 1;
                                return (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={togglePurpose}
                                        className={`relative inline-flex items-center px-6 py-2 text-[14px] font-semibold transition-all duration-200 ${isActive ? 'bg-[color:var(--color-primary)] text-white' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                                    >
                                        {!isLast && <span className="absolute right-0 top-1/2 h-7 w-px -translate-y-1/2 bg-slate-200" aria-hidden="true" />}
                                        {lbl}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Merged filter segments */}
                        <div>
                        <div className="inline-flex max-w-full overflow-x-auto rounded-tl-none rounded-tr-[14px] rounded-b-none border border-b-0 border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {([
                            ['type', 'Type', currentTypeLabel],
                            ['price', 'Price', currentPriceLabel],
                            ['location', 'Location', currentLocationLabel],
                            ['size', 'Area', currentSizeLabel],
                            ['category', 'Category', currentCategoryLabel],
                            ['listedBy', 'Posted by', currentListedByLabel],
                        ] as Array<[Exclude<HomeSearchPanel, null>, string, string]>).map(([key, label, value], index, arr) => {
                                    const hasValue = value !== 'Any type' && value !== 'Any budget' && value !== 'Any location' && value !== 'Any size' && value !== 'Any category' && value !== 'Any posted by';
                            const isLast = index === arr.length - 1;
                                    return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => openModal(key)}
                                    className={`group relative inline-flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-left text-[13px] font-semibold transition-all duration-150 sm:px-5 ${hasValue ? 'bg-[color:var(--color-primary)]/6 text-[color:var(--color-primary)]' : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    {!isLast && <span className="absolute right-0 top-1/2 h-6 w-px -translate-y-1/2 bg-slate-200" aria-hidden="true" />}
                                    <span className={`text-[13px] font-medium text-slate-500 ${hasValue ? 'hidden sm:inline' : 'inline'}`}>{label}:</span>
                                    <span className={`truncate max-w-[120px] ${hasValue ? 'inline' : 'hidden sm:inline'}`}>
                                        {key === 'price' ? (
                                            <>
                                                <span className="sm:hidden">{hasValue ? currentPriceLabelShort : ''}</span>
                                                <span className="hidden sm:inline">{value}</span>
                                            </>
                                        ) : (
                                            <>{value}</>
                                        )}
                                    </span>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block shrink-0 opacity-50">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                    );
                        })}
                        </div>
                        </div>

                        <div className="mt-0">
                            <div className="flex items-center gap-2.5 rounded-t-none rounded-b-[18px] border border-[color:var(--color-primary)]/25 bg-white px-3 py-2 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:gap-3 sm:rounded-t-none sm:rounded-b-[24px] sm:px-4 sm:py-2.5">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[color:var(--color-primary)] sm:h-[22px] sm:w-[22px]">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                                    placeholder="Search by property, area, landmark, or developer"
                                    className="w-full bg-transparent text-[14px] font-semibold text-slate-900 outline-none placeholder:text-slate-400 sm:text-[15px]"
                                />
                                <button
                                    type="button"
                                    onClick={submitSearch}
                                    title="Search properties"
                                    aria-label="Search properties"
                                    className="inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white shadow-[0_12px_24px_rgba(10,107,255,0.28)] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] sm:h-9 sm:w-9"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={submitMapSearch}
                                    className="inline-flex h-8.5 shrink-0 items-center justify-center gap-2 rounded-full bg-[color:var(--color-primary)] px-3.5 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(10,107,255,0.28)] transition-all hover:opacity-90 sm:h-9 sm:px-4 sm:text-[14px]"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                        <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
                                        <path d="M9 4v14" />
                                        <path d="M15 6v14" />
                                    </svg>
                                    <span className="hidden sm:inline">Search in maps</span>
                                    <span className="sm:hidden">Maps</span>
                                </button>
                            </div>
                        </div>
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
                        className={`relative z-10 w-[calc(100vw-2rem)] max-w-lg mx-4 mb-4 sm:mb-0 max-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] border border-[color:var(--color-primary)]/12 bg-white text-slate-900 shadow-[0_32px_80px_rgba(15,23,42,0.18)] transition-all duration-200 ease-out ${isModalVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-[0.97] opacity-0'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <span className="text-[15px] font-black text-slate-900">
                                {activePanel === 'type' && 'Type'}
                                {activePanel === 'price' && 'Price'}
                                {activePanel === 'location' && 'Location'}
                                {activePanel === 'size' && 'Size'}
                                {activePanel === 'listedBy' && 'Listed by'}
                                {activePanel === 'category' && 'Category'}
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
                        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-5">
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
        byTypePurpose: {
            house: { sale: number; rent: number };
            land: { sale: number; rent: number };
            building: { sale: number; rent: number };
            apartment: { sale: number; rent: number };
            flat: { sale: number; rent: number };
            business: { sale: number; rent: number };
            commercialSpace: { sale: number; rent: number };
            officeSpace: { sale: number; rent: number };
        };
        byNatureTypePurpose: {
            residential: {
                house: { sale: number; rent: number };
                land: { sale: number; rent: number };
                building: { sale: number; rent: number };
                apartment: { sale: number; rent: number };
                flat: { sale: number; rent: number };
                business: { sale: number; rent: number };
                commercialSpace: { sale: number; rent: number };
                officeSpace: { sale: number; rent: number };
            };
            commercial: {
                house: { sale: number; rent: number };
                land: { sale: number; rent: number };
                building: { sale: number; rent: number };
                apartment: { sale: number; rent: number };
                flat: { sale: number; rent: number };
                business: { sale: number; rent: number };
                commercialSpace: { sale: number; rent: number };
                officeSpace: { sale: number; rent: number };
            };
            'semi-commercial': {
                house: { sale: number; rent: number };
                land: { sale: number; rent: number };
                building: { sale: number; rent: number };
                apartment: { sale: number; rent: number };
                flat: { sale: number; rent: number };
                business: { sale: number; rent: number };
                commercialSpace: { sale: number; rent: number };
                officeSpace: { sale: number; rent: number };
            };
        };
        forSale: {
            house: number;
            land: number;
            apartment: number;
            business: number;
            building?: number;
        };
        forRent: {
            flat: number;
            house: number;
            apartment: number;
            commercialSpace: number;
            officeSpace: number;
            business: number;
            totalRent: number;
        };
        requirements: {
            total: number;
            rental: number;
            purchase: number;
            purchaseByType?: {
                house: number;
                land: number;
                apartment: number;
                business: number;
            };
            rentalByType?: {
                flat: number;
                house: number;
                apartment: number;
                commercialSpace: number;
                officeSpace: number;
                business: number;
            };
            byNatureType: {
                residential: {
                    purchaseByType: {
                        house: number;
                        land: number;
                        apartment: number;
                        business: number;
                    };
                    rentalByType: {
                        flat: number;
                        house: number;
                        apartment: number;
                        commercialSpace: number;
                        officeSpace: number;
                        business: number;
                    };
                };
                commercial: {
                    purchaseByType: {
                        house: number;
                        land: number;
                        apartment: number;
                        business: number;
                    };
                    rentalByType: {
                        flat: number;
                        house: number;
                        apartment: number;
                        commercialSpace: number;
                        officeSpace: number;
                        business: number;
                    };
                };
                'semi-commercial': {
                    purchaseByType: {
                        house: number;
                        land: number;
                        apartment: number;
                        business: number;
                    };
                    rentalByType: {
                        flat: number;
                        house: number;
                        apartment: number;
                        commercialSpace: number;
                        officeSpace: number;
                        business: number;
                    };
                };
            };
        };
    };
};

type ExploreCategoryItem = {
    icon: string;
    label: string;
    count: number;
    href: string;
};

type ExploreCategoryGroup = {
    label: string;
    items: ExploreCategoryItem[];
};

function PostPropertySection() {
    const cards = [
        {
            key: 'sell-property',
            title: 'Sell your Property',
            subtitle: 'Post Property',
            icon: '/icons/sack-dollar.svg',
            href: '/sell?purpose=sale',
        },
        {
            key: 'rent-out-property',
            title: 'Give on Rent',
            subtitle: 'Post Property',
            icon: '/icons/house-chimney.svg',
            href: '/sell?purpose=rent',
        },
        {
            key: 'buy-requirement',
            title: 'Looking to buy',
            subtitle: 'Post Requirement',
            icon: '/icons/land-location.svg',
            href: '/requirements/new?purpose=sale',
        },
        {
            key: 'rent-requirement',
            title: 'Looking to rent',
            subtitle: 'Post Requirement',
            icon: '/icons/apartment.svg',
            href: '/requirements/new?purpose=rent',
        },
    ];

    const groupedCards = [
        {
            key: 'property',
            icon: '/icons/sack-dollar.svg',
            actions: [cards[0], cards[1]],
        },
        {
            key: 'requirement',
            icon: '/icons/note.svg',
            actions: [cards[2], cards[3]],
        },
    ];

    return (
        <section className="w-full">
            <div className="mb-5 space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Post Property or Requirement</h2>
                <p className="text-sm text-slate-500">List your property for sale or rent, or post what you&apos;re looking for.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 min-[480px]:hidden">
                {cards.map((card) => (
                    <Link
                        key={card.key}
                        href={card.href}
                        className="group flex items-stretch gap-2.5 rounded-2xl border border-slate-200 bg-white pl-3 pr-3 py-2.5 shadow-sm transition-all duration-200 hover:border-[color:var(--color-primary)]/35 hover:shadow-md hover:-translate-y-px"
                    >
                        <div className="flex w-9 items-center justify-center shrink-0">
                            <span
                                aria-hidden="true"
                                className="h-4 w-4 bg-[color:var(--color-primary)]"
                                style={{
                                    WebkitMaskImage: `url(${card.icon})`,
                                    maskImage: `url(${card.icon})`,
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                }}
                            />
                        </div>
                        <div className="min-w-0 flex flex-col justify-center gap-0">
                            <div className="text-[13px] font-semibold text-slate-800 group-hover:text-[color:var(--color-primary)] transition-colors truncate">
                                {card.title}
                            </div>
                            <div className="text-[12px] font-medium text-slate-500 group-hover:text-[color:var(--color-primary)] transition-colors truncate">
                                {card.subtitle}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="hidden grid-cols-1 gap-2 min-[480px]:grid md:grid-cols-2">
                {groupedCards.map((group) => (
                    <div
                        key={group.key}
                        className="flex items-stretch rounded-2xl border border-slate-200 bg-white pl-3 pr-2 py-2.5 shadow-sm"
                    >
                        <div className="flex w-9 shrink-0 items-center justify-center">
                            <span
                                aria-hidden="true"
                                className="h-4 w-4 bg-[color:var(--color-primary)]"
                                style={{
                                    WebkitMaskImage: `url(${group.icon})`,
                                    maskImage: `url(${group.icon})`,
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                }}
                            />
                        </div>
                        <div className="ml-2.5 grid min-w-0 flex-1 grid-cols-2 divide-x divide-slate-200 border-l border-slate-200">
                            {group.actions.map((card) => (
                                <Link
                                    key={card.key}
                                    href={card.href}
                                    className="group min-w-0 px-3 transition-colors hover:text-[color:var(--color-primary)]"
                                >
                                    <div className="truncate text-[13px] font-semibold text-slate-800 transition-colors group-hover:text-[color:var(--color-primary)]">
                                        {card.title}
                                    </div>
                                    <div className="truncate text-[12px] font-medium text-slate-500 transition-colors group-hover:text-[color:var(--color-primary)]">
                                        {card.subtitle}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function PropertyCollectionsSection({ collections }: { collections?: any[] }) {
    if (!collections || collections.length === 0) return null;

    return (
        <section className="w-full">
            <div className="mb-5 space-y-0.5">
                <h2 className="text-lg font-bold text-slate-900">Most Searched Categories</h2>
                <p className="text-sm text-slate-400">Property collections that are most looked.</p>
            </div>

            <div className="overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="grid w-max auto-cols-max grid-flow-col grid-rows-2 gap-2">
                    {collections.map((collection) => {
                        const propertyCount = collection._count?.properties ?? collection.properties?.length ?? 0;

                        return (
                            <Link
                                key={collection.id}
                                href={`/collection/${collection.slug}`}
                                className="group flex min-h-[62px] w-[230px] items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-[color:var(--color-primary)]/35 hover:shadow-md"
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-[13px] font-semibold text-slate-800 transition-colors group-hover:text-[color:var(--color-primary)]">
                                        {collection.name}
                                    </div>
                                    <div className="mt-0.5 truncate text-[12px] font-medium text-slate-500 transition-colors group-hover:text-[color:var(--color-primary)]">
                                        {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function ExploreCategoriesSection({
    stats,
    selectedCategory,
    pathname,
    searchParamsString,
}: {
    stats: NonNullable<HomeClientProps['exploreCategoryStats']>;
    selectedCategory: CategoryType | null;
    pathname: string;
    searchParamsString: string;
}) {
    const categoryLinks = [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Semi Commercial', value: 'semi-commercial' },
    ] as const;
    const scopedStats = selectedCategory ? stats.byNatureTypePurpose[selectedCategory] : null;
    const scopedRequirementStats = selectedCategory ? stats.requirements.byNatureType[selectedCategory] : null;
    const withCategory = (href: string) => {
        if (!selectedCategory) return href;
        return `${href}${href.includes('?') ? '&' : '?'}category=${selectedCategory}`;
    };
    const getCategoryHref = (category: CategoryType) => {
        const params = new URLSearchParams(searchParamsString);
        if (selectedCategory === category) {
            params.delete('category');
        } else {
            params.set('category', category);
        }
        const query = params.toString();
        return query ? `${pathname}?${query}` : pathname;
    };

    const propertyGroups: ExploreCategoryGroup[] = [
        {
            label: 'For Sale',
            items: [
                { icon: '/icons/house-chimney.svg', label: 'House', count: scopedStats?.house.sale ?? stats.forSale.house ?? 0, href: withCategory('/search?purposes=sale&types=house') },
                { icon: '/icons/land-location.svg', label: 'Land', count: scopedStats?.land.sale ?? stats.forSale.land ?? 0, href: withCategory('/search?purposes=sale&types=land') },
                { icon: '/icons/apartment.svg', label: 'Apartment', count: scopedStats?.apartment.sale ?? stats.forSale.apartment ?? stats.forSale.building ?? 0, href: withCategory('/search?purposes=sale&types=apartment') },
                { icon: '/icons/growth-chart-invest.svg', label: 'Commercial Buildings', count: scopedStats?.building.sale ?? stats.byTypePurpose.building.sale ?? 0, href: withCategory('/search?purposes=sale&types=building') },
            ],
        },
        {
            label: 'For Rent',
            items: [
                { icon: '/icons/apartment.svg', label: 'Flat', count: scopedStats?.flat.rent ?? stats.forRent.flat ?? 0, href: withCategory('/search?purposes=rent&types=flat') },
                { icon: '/icons/house-chimney.svg', label: 'House', count: scopedStats?.house.rent ?? stats.forRent.house ?? 0, href: withCategory('/search?purposes=rent&types=house') },
                { icon: '/icons/apartment.svg', label: 'Apartment', count: scopedStats?.apartment.rent ?? stats.forRent.apartment ?? 0, href: withCategory('/search?purposes=rent&types=apartment') },
                { icon: '/icons/land-location.svg', label: 'Land', count: scopedStats?.land.rent ?? stats.byTypePurpose.land.rent ?? 0, href: withCategory('/search?purposes=rent&types=land') },
                { icon: '/icons/note.svg', label: 'Office Space', count: scopedStats?.officeSpace.rent ?? stats.forRent.officeSpace ?? 0, href: withCategory('/search?purposes=rent&types=office-space') },
                { icon: '/icons/growth-chart-invest.svg', label: 'Shop', count: scopedStats?.business.rent ?? stats.forRent.business ?? 0, href: withCategory('/search?purposes=rent&types=business') },
            ],
        },
    ];

    const requirementGroups: ExploreCategoryGroup[] = [
        {
            label: 'For Sale',
            items: [
                { icon: '/icons/house-chimney.svg', label: 'House', count: scopedRequirementStats?.purchaseByType.house ?? stats.requirements.purchaseByType?.house ?? 0, href: withCategory('/?tab=requirements&purpose=sale&type=house') },
                { icon: '/icons/land-location.svg', label: 'Land', count: scopedRequirementStats?.purchaseByType.land ?? stats.requirements.purchaseByType?.land ?? 0, href: withCategory('/?tab=requirements&purpose=sale&type=land') },
                { icon: '/icons/apartment.svg', label: 'Apartment', count: scopedRequirementStats?.purchaseByType.apartment ?? stats.requirements.purchaseByType?.apartment ?? 0, href: withCategory('/?tab=requirements&purpose=sale&type=apartment') },
                { icon: '/icons/growth-chart-invest.svg', label: 'Business', count: scopedRequirementStats?.purchaseByType.business ?? stats.requirements.purchaseByType?.business ?? 0, href: withCategory('/?tab=requirements&purpose=sale&type=business') },
            ],
        },
        {
            label: 'For Rent',
            items: [
                { icon: '/icons/apartment.svg', label: 'Flat', count: scopedRequirementStats?.rentalByType.flat ?? stats.requirements.rentalByType?.flat ?? 0, href: withCategory('/?tab=requirements&purpose=rent&type=flat') },
                { icon: '/icons/house-chimney.svg', label: 'House', count: scopedRequirementStats?.rentalByType.house ?? stats.requirements.rentalByType?.house ?? 0, href: withCategory('/?tab=requirements&purpose=rent&type=house') },
                { icon: '/icons/apartment.svg', label: 'Apartment', count: scopedRequirementStats?.rentalByType.apartment ?? stats.requirements.rentalByType?.apartment ?? 0, href: withCategory('/?tab=requirements&purpose=rent&type=apartment') },
                { icon: '/icons/apartment.svg', label: 'Commercial Space', count: scopedRequirementStats?.rentalByType.commercialSpace ?? stats.requirements.rentalByType?.commercialSpace ?? 0, href: withCategory('/?tab=requirements&purpose=rent&type=commercial-space') },
                { icon: '/icons/note.svg', label: 'Office Space', count: scopedRequirementStats?.rentalByType.officeSpace ?? stats.requirements.rentalByType?.officeSpace ?? 0, href: withCategory('/?tab=requirements&purpose=rent&type=office-space') },
                { icon: '/icons/growth-chart-invest.svg', label: 'Business', count: scopedRequirementStats?.rentalByType.business ?? stats.requirements.rentalByType?.business ?? 0, href: withCategory('/?tab=requirements&purpose=rent&type=business') },
            ],
        },
    ];

    const renderGroups = (
        groups: ExploreCategoryGroup[],
        noun: 'property' | 'requirement',
    ) => (
        <div className="space-y-3">
            {groups.map((group) => (
                <div key={group.label} className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-700">{group.label}</h3>
                    <div className="overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div className="inline-flex min-w-max gap-2">
                            {group.items.map((item) => {
                                const desktopNoun = noun === 'property'
                                    ? (item.count === 1 ? 'property' : 'properties')
                                    : (item.count === 1 ? noun : `${noun}s`);
                                const mobileNoun = noun === 'property'
                                    ? (item.count === 1 ? 'prop' : 'props')
                                    : desktopNoun;

                                return (
                                    <Link
                                        key={`${group.label}-${item.label}`}
                                        href={item.href}
                                        className="group flex w-fit items-stretch gap-2.5 rounded-2xl border border-slate-200 bg-white py-2.5 pl-3 pr-4 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-[color:var(--color-primary)]/35 hover:shadow-md"
                                    >
                                        <div className="flex w-9 shrink-0 items-center justify-center">
                                            <span
                                                aria-hidden="true"
                                                className="h-4 w-4 bg-[color:var(--color-primary)]"
                                                style={{
                                                    WebkitMaskImage: `url(${item.icon})`,
                                                    maskImage: `url(${item.icon})`,
                                                    WebkitMaskRepeat: 'no-repeat',
                                                    maskRepeat: 'no-repeat',
                                                    WebkitMaskPosition: 'center',
                                                    maskPosition: 'center',
                                                    WebkitMaskSize: 'contain',
                                                    maskSize: 'contain',
                                                }}
                                            />
                                        </div>
                                        <div className="flex min-w-0 flex-col justify-center gap-0">
                                            <div className="whitespace-nowrap text-[13px] font-semibold text-slate-800 transition-colors group-hover:text-slate-900">
                                                {item.label}
                                            </div>
                                            <div className="whitespace-nowrap text-[12px] font-medium text-slate-500 transition-colors group-hover:text-[color:var(--color-primary)]">
                                                {item.count}{' '}
                                                <span className="sm:hidden">{mobileNoun}</span>
                                                <span className="hidden sm:inline">{desktopNoun}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <section className="w-full space-y-10">
            <div className="mb-5 space-y-0.5">
                <h2 className="text-lg font-bold text-slate-900">Browse by category</h2>
                <div className="flex flex-wrap items-center gap-x-2 text-sm text-slate-400">
                    <span>Browse</span>
                    {categoryLinks.map((item, index) => (
                        <React.Fragment key={item.label}>
                            <span className="text-slate-300">|</span>
                            <Link
                                href={getCategoryHref(item.value)}
                                className={`transition-colors hover:text-[color:var(--color-primary)] ${selectedCategory === item.value ? 'font-semibold text-[color:var(--color-primary)]' : ''}`}
                            >
                                {item.label}
                            </Link>
                        </React.Fragment>
                    ))}
                    <span>properties</span>
                </div>
            </div>

            {renderGroups(propertyGroups, 'property')}

            <div className="space-y-5">
                <div className="space-y-0.5">
                    <h2 className="text-lg font-bold text-slate-900">See what people are looking for</h2>
                    <div className="flex flex-wrap items-center gap-x-2 text-sm text-slate-400">
                        <span>Browse</span>
                        {categoryLinks.map((item) => (
                            <React.Fragment key={`requirements-${item.label}`}>
                                <span className="text-slate-300">|</span>
                                <Link
                                    href={getCategoryHref(item.value)}
                                    className={`transition-colors hover:text-[color:var(--color-primary)] ${selectedCategory === item.value ? 'font-semibold text-[color:var(--color-primary)]' : ''}`}
                                >
                                    {item.label}
                                </Link>
                            </React.Fragment>
                        ))}
                        <span>requirements</span>
                    </div>
                </div>
                {renderGroups(requirementGroups, 'requirement')}
            </div>
        </section>
    );
}

export default function HomeClient({ user, featuredCollections, trendingSearches, featuredProperties = [], advertisements = [], exploreCategoryStats, siteSettings }: HomeClientProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [activeFeedTab, setActiveFeedTab] = useState<'property' | 'requirements'>('property');

    const [properties, setProperties] = useState<any[]>([]);
    const [requirements, setRequirements] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const featuredCards = resolveFeaturedCards(featuredProperties);

    // Derived ads data - all active ads can appear in both carousel and feed
    const activeAds = advertisements.filter((ad: any) => ad.status === 'active').map((ad: any) => ({
        ...ad,
        posted_by: ad.posted_by || ad.title // Ensure posted_by is available for the carousel UI
    }));

    const queryFilters = new URLSearchParams(searchParams.toString());
    const selectedFeedType = queryFilters.get('tab');
    const selectedTypeFilters = queryFilters.getAll('type').map((value) => value.trim().toLowerCase()).filter(Boolean);
    const selectedRequirementTypes = selectedTypeFilters.filter((value) => value !== 'requirements' && value !== 'property');
    const selectedPurposeFilters = normalizeQueryList([queryFilters.get('purpose')]);
    const selectedFacingFilters = normalizeQueryList([queryFilters.get('facing')]);
    const selectedCategoryFilter = normalizeQueryList([queryFilters.get('category')])[0] ?? null;
    const selectedLocationFilters = normalizeQueryList([
        queryFilters.get('location'),
        queryFilters.get('district'),
        queryFilters.get('cityVillage'),
        queryFilters.get('area'),
    ]);

    const minPriceParam = Number(queryFilters.get('minPrice') || queryFilters.get('priceMin') || '');
    const maxPriceParam = Number(queryFilters.get('maxPrice') || queryFilters.get('priceMax') || '');
    const hasMinPriceFilter = Number.isFinite(minPriceParam);
    const hasMaxPriceFilter = Number.isFinite(maxPriceParam);
    const queryMinPrice = hasMinPriceFilter ? minPriceParam : null;
    const queryMaxPrice = hasMaxPriceFilter ? maxPriceParam : null;
    const hasAnyFeedFilters = selectedRequirementTypes.length > 0 || selectedPurposeFilters.length > 0 || selectedFacingFilters.length > 0 || selectedLocationFilters.length > 0 || Boolean(selectedCategoryFilter) || hasMinPriceFilter || hasMaxPriceFilter;

    const filteredRequirements = requirements.filter((requirement: any) => {
        if (!includesAny(collectNamedValues(requirement.propertyTypes ? requirement.propertyTypes.split(',') : []), selectedRequirementTypes)) return false;
        if (!includesAny(collectNamedValues(requirement.purposes ? requirement.purposes.split(',') : []), selectedPurposeFilters)) return false;
        const requirementCategories = collectNamedValues(requirement.natures ? requirement.natures.split(',') : []).map((value) => value.replace(/\s+/g, '-'));
        if (!includesAny(requirementCategories, selectedCategoryFilter ? [selectedCategoryFilter] : [])) return false;
        if (!includesAny(collectNamedValues(requirement.facings ? requirement.facings.split(',') : []), selectedFacingFilters)) return false;
        if (!matchesLocationParts([requirement.area, requirement.cityVillage, requirement.district], selectedLocationFilters)) return false;

        if (queryMinPrice != null) {
            const upperBound = requirement.maxPrice ?? requirement.minPrice ?? null;
            if (upperBound != null && upperBound < queryMinPrice) return false;
        }

        if (queryMaxPrice != null) {
            const lowerBound = requirement.minPrice ?? requirement.maxPrice ?? null;
            if (lowerBound != null && lowerBound > queryMaxPrice) return false;
        }

        return true;
    });

    const filteredProperties = properties.filter((property: any) => {
        if (!includesAny(collectNamedValues(property.types), selectedRequirementTypes)) return false;
        if (!includesAny(collectNamedValues(property.purposes), selectedPurposeFilters)) return false;
        const propertyCategories = collectNamedValues(property.natures).map((value) => value.replace(/\s+/g, '-'));
        if (!includesAny(propertyCategories, selectedCategoryFilter ? [selectedCategoryFilter] : [])) return false;
        if (!includesAny(normalizeQueryList([property.facingDirection, property.facing]), selectedFacingFilters)) return false;
        if (!matchesLocationParts([
            property.location?.area,
            property.location?.cityVillage,
            property.location?.city,
            property.location?.district,
            property.location,
        ], selectedLocationFilters)) return false;

        const priceValue = Number(property.pricing?.price || property.price || NaN);
        if (queryMinPrice != null && Number.isFinite(priceValue) && priceValue < queryMinPrice) return false;
        if (queryMaxPrice != null && Number.isFinite(priceValue) && priceValue > queryMaxPrice) return false;

        return true;
    });

    const visibleFeaturedCards = featuredCards.filter((property: any) => {
        if (!selectedCategoryFilter) return true;
        const propertyCategories = collectNamedValues(property.natures).map((value) => value.replace(/\s+/g, '-'));
        return includesAny(propertyCategories, [selectedCategoryFilter]);
    });

    const visibleProperties = hasAnyFeedFilters && selectedFeedType === 'property' ? filteredProperties : properties;

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

    const fetchRequirements = async () => {
        setIsLoadingRequirements(true);
        try {
            const res = await fetch('/api/requirements');
            const data = await res.json();

            if (Array.isArray(data)) {
                const activeRequirements = data.filter((item: any) => item?.status === 'active');
                setRequirements(activeRequirements);
            }
        } catch (err) {
            console.error('Failed to load requirements:', err);
        } finally {
            setIsLoadingRequirements(false);
        }
    };

    useEffect(() => {
        fetchProperties(true);
        fetchRequirements();
    }, []);

    useEffect(() => {
        const tab = searchParams.get('tab');
        const typeFilters = searchParams.getAll('type').map((value) => value.trim().toLowerCase()).filter(Boolean);
        const shouldShowRequirements = tab === 'requirements' || typeFilters.includes('requirements');
        setActiveFeedTab(shouldShowRequirements ? 'requirements' : 'property');
    }, [searchParams]);

    const handleFeedTabChange = (tab: 'property' | 'requirements') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab === 'requirements' ? 'requirements' : 'properties');
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Check if the page is loading content */}
            {isLoading ? (
                <FeedSkeleton hasCarouselAds={carouselAds.length > 0} />
            ) : (
                <div className="w-full">
                    <div className="mx-auto w-full max-w-[1400px] px-0.5 pt-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                        <HomeSearchHero />

                        {exploreCategoryStats && siteSettings?.show_explore_categories !== false && (
                            <ExploreCategoriesSection
                                stats={exploreCategoryStats}
                                selectedCategory={selectedCategoryFilter as CategoryType | null}
                                pathname={pathname}
                                searchParamsString={searchParams.toString()}
                            />
                        )}

                        <div>
                            <PostPropertySection />
                        </div>

                        {siteSettings?.show_property_collection !== false && featuredCollections && featuredCollections.length > 0 && (
                            <PropertyCollectionsSection collections={featuredCollections} />
                        )}
                    </div>

                    {/* Hero Carousel Ad */}
                    {siteSettings?.show_hero_carousel_ad !== false && carouselAds.length > 0 && (
                        <div className="w-full mx-auto max-w-[1400px] px-0.5 sm:px-6 lg:px-8 mt-8 sm:mt-12">
                            <div className="mb-5 space-y-1">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">Sponsored Deals</h2>
                                <p className="text-sm text-slate-500">Promoted listings from verified partners and agencies.</p>
                            </div>
                            <HeroCarouselAd ads={carouselAds} />
                        </div>
                    )}

                    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 sm:gap-12 px-0.5 sm:px-6 lg:px-8 mt-8 sm:mt-12">
                        {/* Featured Properties Section (eSewa Style) */}
                        {siteSettings?.show_featured_properties !== false && visibleFeaturedCards.length > 0 && (
                            <section className="w-full">
                                <SectionTitleFeed
                                    title="Featured Properties"
                                    description="Curated listings with complete details and verified media."
                                    ctaText="View more"
                                    ctaHref="/search"
                                />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {visibleFeaturedCards.slice(0, 4).map((prop: any) => (
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
                                    <div className="mb-5 space-y-1">
                                        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                                                    {/* Consistent tab label: always show "Properties | Requirements" */}
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFeedTabChange('property')}
                                                            className={`cursor-pointer transition-colors ${activeFeedTab === 'property' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}
                                                        >
                                                            Properties
                                                        </button>
                                                        <span className="text-slate-300">|</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFeedTabChange('requirements')}
                                                            className={`cursor-pointer transition-colors ${activeFeedTab === 'requirements' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}
                                                        >
                                                            Requirements
                                                        </button>
                                                    </>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            Real-time stream of premium listings, sponsored placements, and curated discovery signals.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-6">
                                            {activeFeedTab === 'requirements' ? (
                                                <div className="rounded-[28px] border border-slate-300 bg-white shadow-[var(--shadow-card)] overflow-hidden">
                                                    {isLoadingRequirements ? (
                                                        <div className="p-8 text-sm text-slate-500">Loading requirements...</div>
                                                    ) : requirements.length === 0 ? (
                                                        <div className="p-8 text-sm text-slate-500">No active requirements available right now.</div>
                                                    ) : filteredRequirements.length === 0 ? (
                                                        <div className="p-8 text-sm text-slate-500">No matching requirements found.</div>
                                                    ) : (
                                                        filteredRequirements.map((requirement: any, requirementIndex: number) => {
                                                            const requirementUrl = `/requirement/${requirement.id}`;
                                                            const contactNumber = requirement.user?.contact_number || '';
                                                            const waNumber = String(contactNumber).replace(/[^\d+]/g, '').replace(/^\+/, '');
                                                            const phoneNumber = String(contactNumber).replace(/[^\d+]/g, '');
                                                            const phoneHref = phoneNumber ? `tel:${phoneNumber}` : null;
                                                            const whatsappHref = waNumber ? `https://wa.me/${waNumber}` : null;
                                                            const locationLabel = [requirement.area, requirement.cityVillage, requirement.district].filter(Boolean).join(', ') || 'Any Location';
                                                            const budgetLabel = requirement.minPrice && requirement.maxPrice
                                                                ? `${formatNPR(requirement.minPrice)} - ${formatNPR(requirement.maxPrice)}`
                                                                : requirement.maxPrice
                                                                    ? `Up to ${formatNPR(requirement.maxPrice)}`
                                                                    : requirement.minPrice
                                                                        ? `From ${formatNPR(requirement.minPrice)}`
                                                                        : 'Budget negotiable';
                                                            const summary = requirement.mode === 'simple'
                                                                ? requirement.content
                                                                : requirement.remarks || 'Detailed requirement submitted.';
                                                            const title = requirement.mode === 'simple'
                                                                ? 'General Property Requirement'
                                                                : `${(requirement.propertyTypes || 'Property').split(',')[0]} requirement`;
                                                            const titleWithLocation = `${title}, ${locationLabel}`;

                                                            return (
                                                                <div
                                                                    key={requirement.id || `requirement-${requirementIndex}`}
                                                                    role="link"
                                                                    tabIndex={0}
                                                                    onClick={() => router.push(requirementUrl)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                                            e.preventDefault();
                                                                            router.push(requirementUrl);
                                                                        }
                                                                    }}
                                                                    className={`relative hover:z-10 px-4 sm:px-5 pt-3 sm:pt-3.5 pb-1 sm:pb-1.5 transition-[box-shadow,border-color,background-color] duration-300 hover:bg-slate-50/70 hover:ring-2 hover:ring-inset hover:ring-[color:var(--color-primary)] cursor-pointer ${requirementIndex === 0 ? 'rounded-t-[28px]' : ''} ${requirementIndex === filteredRequirements.length - 1 ? 'rounded-b-[28px]' : ''} ${requirementIndex !== filteredRequirements.length - 1 ? 'border-b border-slate-200 hover:border-b-transparent' : ''}`}
                                                                >
                                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <h3 className="text-[13px] sm:text-[14px] font-semibold text-slate-900 leading-snug">{titleWithLocation}</h3>
                                                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                                                                                {requirement.purposes || 'Any purpose'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[11px] sm:text-[12px] text-slate-400 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed">{summary || 'No additional remarks shared.'}</p>
                                                                        <div className="text-[14px] sm:text-[15px] font-bold text-slate-900 mt-2">{budgetLabel}</div>
                                                                        <div className="border-t border-slate-100 mt-1.5" />
                                                                        <div className="flex items-center justify-between pt-1 pb-0.5 gap-2">
                                                                            <span className="inline-flex items-center gap-2 min-w-0">
                                                                                {requirement.user?.username ? (
                                                                                    <Link
                                                                                        href={`/@${requirement.user.username}`}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="text-[12px] text-slate-500 font-medium truncate max-w-[90px] sm:max-w-[130px] hover:text-[color:var(--color-primary)] hover:underline transition-colors"
                                                                                    >
                                                                                        {requirement.user?.name || 'Anonymous user'}
                                                                                    </Link>
                                                                                ) : (
                                                                                    <span className="text-[12px] text-slate-500 font-medium truncate max-w-[90px] sm:max-w-[130px]">{requirement.user?.name || 'Anonymous user'}</span>
                                                                                )}
                                                                                {typeof requirement.user?._count?.requirements === 'number' && (
                                                                                    <>
                                                                                        <span className="text-slate-400 text-[12px] font-medium">•</span>
                                                                                        <Link
                                                                                            href={`/@${requirement.user.username}/requirements`}
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            className="text-[12px] text-slate-500 font-medium shrink-0 hover:text-[color:var(--color-primary)] hover:underline transition-colors"
                                                                                        >
                                                                                            {requirement.user._count.requirements} requirements
                                                                                        </Link>
                                                                                    </>
                                                                                )}
                                                                                {phoneHref && (
                                                                                    <a
                                                                                        href={phoneHref}
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="hidden sm:flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 transition-colors flex-shrink-0"
                                                                                        aria-label="Call user"
                                                                                    >
                                                                                        <PhoneIcon />
                                                                                    </a>
                                                                                )}
                                                                                {whatsappHref && (
                                                                                    <a
                                                                                        href={whatsappHref}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="hidden sm:flex items-center justify-center p-2 rounded-lg text-[#25D366] hover:text-[#1aab52] hover:bg-[color:var(--color-primary)]/10 transition-colors flex-shrink-0"
                                                                                        aria-label="Message on WhatsApp"
                                                                                    >
                                                                                        <WhatsAppIcon />
                                                                                    </a>
                                                                                )}
                                                                            </span>
                                                                            <span className="flex items-center gap-1.5 flex-shrink-0">
                                                                                <span className="text-[11px] text-slate-400 font-medium">{formatTimeAgo(requirement.created_at)}</span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        const shareUrl = `${window.location.origin}/requirement/${requirement.id}`;

                                                                                        if (navigator.share) {
                                                                                            navigator.share({ url: shareUrl });
                                                                                            return;
                                                                                        }

                                                                                        navigator.clipboard?.writeText(shareUrl);
                                                                                    }}
                                                                                    aria-label="Share requirement"
                                                                                    className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 transition-colors"
                                                                                >
                                                                                    <ShareIcon />
                                                                                </button>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            ) : (
                                            (() => {
                                                const feedItems: any[] = [];
                                                let propertyIndex = 0;
                                                let insertionCount = 0;

                                                const availableCardTypes = ['trending_searches', 'featured_projects'];
                                                const validCardTypes = availableCardTypes.filter(type => {
                                                    if (type === 'trending_searches') return trendingSearches && trendingSearches.length > 0;
                                                    if (type === 'featured_projects') return siteSettings?.show_featured_properties !== false && featuredProperties && featuredProperties.length > 0;
                                                    return false;
                                                });

                                                const addAd = (seedIndex: number) => {
                                                    if (feedAds.length === 0) return;
                                                    const adIndex = seedIndex % feedAds.length;
                                                    feedItems.push({ type: 'ad', data: feedAds[adIndex] });
                                                };

                                                while (propertyIndex < visibleProperties.length) {
                                                    const chunkCount = Math.min(4, visibleProperties.length - propertyIndex);
                                                    const propertySet: any[] = [];

                                                    for (let i = 0; i < chunkCount; i++) {
                                                        propertySet.push(visibleProperties[propertyIndex++]);
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

                                                const triggerPropertyId = visibleProperties.length >= 5 ? visibleProperties[visibleProperties.length - 5]?.id : undefined;

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
                                                                            onVisible={isTrigger && !hasAnyFeedFilters ? () => fetchProperties(false) : undefined}
                                                                            isFirstInSet={isFirstInSet}
                                                                            isLastInSet={isLastInSet}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    } else if (item.type === 'ad') {
                                                        component = siteSettings?.show_feed_ad !== false ? <FeedAd ad={item.data} /> : null;
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
                                            })()
                                            )}
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

                                    {!hasAnyFeedFilters && !hasMore && properties.length > 0 && (
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
            <div className="mx-auto w-full max-w-[1400px] px-0.5 pt-3 sm:px-6 lg:px-8">
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
