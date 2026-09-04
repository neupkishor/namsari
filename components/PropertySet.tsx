'use client';

import React from 'react';
import { InternalPropertyLink } from '@/components/navigation/InternalPropertyLink';
import { formatNPR } from '@/lib/formatters';

export interface PropertySetItem {
    id: number | string;
    title: string;
    slug?: string;
    price?: number | string;
    pricing?: { price?: number | string } | null;
    _displayImage?: string;
    images?: Array<string | { url?: string }>;
    propertyMedia?: Array<{ resourceUrl?: string; url?: string }>;
    types?: Array<string | { name?: string }>;
    features?: {
        bedrooms?: number | string;
        bathrooms?: number | string;
        builtUpArea?: number | string;
        builtUpAreaUnit?: string;
    };
    location?: string | { area?: string; cityVillage?: string; city?: string; district?: string };
    listedBy?: { name?: string };
}

export interface PropertySetProps {
    properties: PropertySetItem[];
    className?: string;
}

const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

function propertyUrl(property: PropertySetItem) {
    const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `/properties/${slug}-${property.id}`;
}

function imageUrl(property: PropertySetItem) {
    const image = property._displayImage || property.images?.[0] || property.propertyMedia?.[0]?.resourceUrl || property.propertyMedia?.[0]?.url;
    return typeof image === 'string' ? image : image?.url || fallbackImage;
}

function imageUrls(property: PropertySetItem) {
    const sourceImages = property.images || property.propertyMedia?.map((image) => image.resourceUrl || image.url) || [];
    const urls = sourceImages.map((image) => typeof image === 'string' ? image : image?.url).filter(Boolean) as string[];
    const primary = property._displayImage || urls[0];
    return primary ? [primary, ...urls.filter((url) => url !== primary)] : urls;
}

function locationLabel(location: PropertySetItem['location']) {
    if (!location) return 'Location unavailable';
    if (typeof location === 'string') return location;
    return [location.area, location.cityVillage, location.city, location.district].filter(Boolean).slice(0, 2).join(', ') || 'Location unavailable';
}

function factBadges(property: PropertySetItem) {
    const features = property.features;
    if (!features) return [];
    return [
        features.bedrooms && `${features.bedrooms} bed`,
        features.bathrooms && `${features.bathrooms} bath`,
        features.builtUpArea && `${features.builtUpArea} ${features.builtUpAreaUnit || 'sq.ft.'}`,
    ].filter(Boolean).slice(0, 3) as string[];
}

export function PropertyCard({ property }: { property: PropertySetItem }) {
    const facts = factBadges(property);
    const images = imageUrls(property);
    const type = property.types?.[0];
    const typeLabel = typeof type === 'string' ? type : type?.name || 'Property';

    return (
        <InternalPropertyLink href={propertyUrl(property)} className="group block h-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[var(--shadow-card)] transition-colors duration-300 hover:border-[color:var(--color-primary)]/40 hover:ring-1 hover:ring-[color:var(--color-primary)]/20">
            <div className="relative overflow-hidden border-b border-slate-200">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={imageUrl(property)} alt={property.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                    <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                        <span className="inline-flex rounded-full border border-white/20 bg-white/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur">{typeLabel}</span>
                        <span className="inline-flex rounded-full border border-white/15 bg-slate-950/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">Featured</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4"><span className="inline-flex rounded-full border border-white/15 bg-slate-950/70 px-3.5 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur">{formatNPR(property.pricing?.price || property.price || 0)}</span></div>
                </div>
                {images.length > 1 && <div className="relative z-10 grid grid-cols-3 gap-1 bg-white p-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                    {images.slice(1, 4).map((url, index) => <div key={`${url}-${index}`} className="relative aspect-[4/3] min-h-[48px] overflow-hidden rounded-[4px] bg-slate-100"><img src={url} alt={`${property.title} image ${index + 2}`} className="absolute inset-0 h-full w-full object-cover" /></div>)}
                </div>}
            </div>
            <div className="flex h-[184px] flex-col gap-3 p-4">
                <div className="space-y-1.5"><h4 className="line-clamp-2 text-[15px] font-bold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-[color:var(--color-primary)]">{property.title}</h4><div className="flex items-center gap-2 text-[12px] text-slate-500"><span aria-hidden="true">⌖</span><span className="truncate">{locationLabel(property.location)}</span></div></div>
                {facts.length > 0 && <div className="flex flex-wrap gap-2">{facts.map((fact) => <span key={fact} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">{fact}</span>)}</div>}
                <div className="mt-auto flex items-center justify-between text-[12px] font-semibold"><span className="text-slate-400">{property.listedBy?.name || 'Verified listing'}</span><span className="text-[color:var(--color-primary)] transition-transform duration-200 group-hover:translate-x-0.5">View details</span></div>
            </div>
        </InternalPropertyLink>
    );
}

export function PropertySet({ properties, className = '' }: PropertySetProps) {
    if (!properties?.length) return null;
    return <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>{properties.slice(0, 4).map((property) => <PropertyCard key={property.id} property={property} />)}</div>;
}

export default PropertySet;
