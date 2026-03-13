'use client';

import React from 'react';
import Link from 'next/link';

interface PropertyCardProps {
    property: {
        id: number | string;
        title: string;
        slug?: string;
        price: string;
        location: string;
        specs?: string;
        images?: string[];
    };
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const propertyUrl = `/properties/${slug}-${property.id}`;

    return (
        <div className="bg-white rounded-[2rem] border border-border shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden flex flex-col h-full group/card relative">
            <Link href={propertyUrl} className="block relative h-72 overflow-hidden group/img">
                <img
                    src={property.images?.[0] ? (typeof property.images[0] === 'string' ? property.images[0] : (property.images[0] as any).url) : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'}
                    alt={property.title}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-1000 group-hover/card:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                    <span className="bg-white/90 backdrop-blur-md text-primary text-[10px] px-3 py-1.5 rounded-xl font-black shadow-2xl border border-primary/10 tracking-widest uppercase">
                        NEW LISTING
                    </span>
                </div>

                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between z-20 transform translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-700">
                    <span className="bg-primary text-white text-[11px] px-4 py-2 rounded-2xl font-black shadow-2xl tracking-widest uppercase">
                        View Details
                    </span>
                </div>
            </Link>

            <div className="p-8 flex-1 flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-primary font-black text-3xl tracking-tighter">
                        {property.price}
                    </span>
                </div>

                <Link href={propertyUrl} className="no-underline text-inherit block group/title">
                    <h3 className="text-xl font-black mb-2 cursor-pointer leading-tight text-text-main group-hover/title:text-primary transition-colors line-clamp-2 tracking-tight">
                        {property.title}
                    </h3>
                </Link>

                <div className="flex flex-wrap items-center gap-3 mt-auto">
                    {property.specs && (
                        <div className="text-[13px] font-bold text-text-main/80 bg-surface px-4 py-2 rounded-2xl border border-border/50 flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            {property.specs}
                        </div>
                    )}
                    
                    <div className="text-[12px] font-bold text-text-muted flex items-center gap-2 bg-surface px-4 py-2 rounded-2xl border border-border/50 italic">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {property.location}
                    </div>
                </div>
            </div>
        </div>
    );
};
