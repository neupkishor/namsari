 'use client';

import React from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/formatters';

interface PropertyCardProps {
    property: {
        id: number | string;
        title: string;
        slug?: string;
        price: number | string;
        listedAt?: string | Date;
        location: string;
        specs?: string;
        images?: string[];
    };
}

function getListingAgeLabel(listedAt?: string | Date): string {
    if (!listedAt) return 'Today';

    const listedDate = new Date(listedAt);
    if (Number.isNaN(listedDate.getTime())) return 'Today';

    const now = new Date();
    const diffMs = now.getTime() - listedDate.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (days < 1) return 'Today';
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} month${months === 1 ? '' : 's'} ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const propertyUrl = `/properties/${slug}-${property.id}`;
    const listingAgeLabel = getListingAgeLabel(property.listedAt);

    return (
        <div className="w-full bg-white rounded-[18px] border border-black/10 shadow-sm transition-colors duration-300 overflow-hidden flex flex-col h-full group/card relative hover:border-[color:var(--color-primary)]/25">
            <Link href={propertyUrl} className="block relative h-56 overflow-hidden rounded-t-[14px] group/img">
                <img
                    src={property.images?.[0] ? (typeof property.images[0] === 'string' ? property.images[0] : (property.images[0] as any).url) : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'}
                    alt={property.title}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover/card:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold text-text-main shadow-sm backdrop-blur-sm">
                        {listingAgeLabel}
                    </span>
                </div>

                {/* subtle hover styling handled by card container; no large overlay */}
            </Link>

            <div className="p-4 flex-1 flex flex-col gap-2">
                <Link href={propertyUrl} className="no-underline text-inherit block group/title">
                    <h3 className="text-sm font-semibold mb-1 cursor-pointer leading-tight text-text-main group-hover/title:text-[color:var(--color-primary)] transition-colors line-clamp-2 tracking-tight">
                        {property.title}
                    </h3>
                </Link>

                <div className="flex items-baseline gap-2">
                    <span className="text-text-main font-bold text-xl tracking-tighter transition-colors group-hover/card:text-[color:var(--color-primary)]">
                        {formatPrice(property.price || property.price, true)}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-auto">
                    {property.specs && (
                        <div className="text-[12px] font-medium text-text-main/80 flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-primary)]/40" />
                            <span>{property.specs}</span>
                        </div>
                    )}
                    
                    <div className="text-[12px] font-medium text-text-muted flex items-center gap-2 italic">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span className="truncate">{property.location}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
