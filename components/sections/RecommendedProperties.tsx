'use client';

import React from 'react';
import Link from 'next/link';
import { AutoScrollCarousel } from '@/components/ui/AutoScrollCarousel';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { SectionTitleFeed } from '@/components/sections/SectionTitleFeed';

interface RecommendedProperty {
    id: number;
    title: string;
    slug?: string | null;
    price: number | string;
    location: string;
    specs: string;
    images: string[];
}

interface RecommendedPropertiesProps {
    properties: RecommendedProperty[];
}

export function RecommendedProperties({ properties }: RecommendedPropertiesProps) {
    if (!properties || properties.length === 0) return null;

    return (
        <section className="w-full mt-12 pt-8 border-t border-[#e5e7eb]">
            <div className="mb-5">
                <SectionTitleFeed
                    title="Recommended Properties"
                    description="Properties you might also like based on this listing."
                    ctaText="View all"
                    ctaHref="/explore"
                />
            </div>

            <AutoScrollCarousel
                gap="16px"
                desktopItemCount={4}
                tabletItemCount={2}
                mobileItemCount={1}
                className="pb-2"
            >
                {properties.map((p) => (
                    <PropertyCard key={p.id} property={{ ...p, slug: p.slug ?? undefined }} />
                ))}
            </AutoScrollCarousel>
        </section>
    );
}
