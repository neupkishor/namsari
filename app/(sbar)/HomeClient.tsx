"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FeaturedProjects } from '@/components/cards/FeaturedProjects';
import { TrendingSearches } from '@/components/cards/TrendingSearches';
import { FeaturedCollectionsFeedItem } from '@/components/cards/FeaturedCollections';
import { AdvertisementCard, AdvertisementCarousel } from '@/components/cards/AdvertisementCard';
import { BottomNavigation } from '@/components/menu/BottomNavigation';
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

type HomeClientProps = {
    user: any;
    featuredCollections?: any[];
    trendingSearches?: string[];
    featuredProperties?: any[];
    featuredAgencies?: any[];
    advertisements?: any[];
    categories?: any[];
};

export default function HomeClient({ user, featuredCollections, trendingSearches, featuredProperties = [], advertisements = [] }: HomeClientProps) {
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
                    {/* Advertisement Carousel - Full Width at Top */}
                    {carouselAds.length > 0 && (
                        <div className="w-full mb-8">
                            <AdvertisementCarousel ads={carouselAds} />
                        </div>
                    )}

                    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10">
                        {/* Featured Properties Section (eSewa Style) */}
                        {featuredCards.length > 0 && (
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
                                        title="Market Activity"
                                        description="Real-time stream of premium listings, sponsored placements, and curated discovery signals."
                                    />

                                    <div className="rounded-[28px] border border-slate-200/80 bg-white shadow-[var(--shadow-card)] overflow-hidden">
                                        <div className="flex flex-col">
                                            {(() => {
                                                const feedItems: any[] = [];
                                                let propertyIndex = 0;
                                                let insertionCount = 0;

                                                const availableCardTypes = ['featured_collections', 'trending_searches', 'featured_projects'];
                                                const validCardTypes = availableCardTypes.filter(type => {
                                                    if (type === 'featured_collections') return featuredCollections && featuredCollections.length > 0;
                                                    if (type === 'trending_searches') return trendingSearches && trendingSearches.length > 0;
                                                    if (type === 'featured_projects') return featuredProperties && featuredProperties.length > 0;
                                                    return false;
                                                });

                                                const addAd = (seedIndex: number) => {
                                                    if (feedAds.length === 0) return;
                                                    const adIndex = seedIndex % feedAds.length;
                                                    feedItems.push({ type: 'ad', data: feedAds[adIndex] });
                                                };

                                                while (propertyIndex < properties.length) {
                                                    const chunkCount = Math.min(4, properties.length - propertyIndex);
                                                    for (let i = 0; i < chunkCount; i++) {
                                                        feedItems.push({ type: 'single', data: properties[propertyIndex++] });
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

                                                const firstPropertyIndex = feedItems.findIndex((entry) => entry.type === 'single');
                                                const lastPropertyIndex = (() => {
                                                    for (let i = feedItems.length - 1; i >= 0; i--) {
                                                        if (feedItems[i].type === 'single') return i;
                                                    }
                                                    return -1;
                                                })();

                                                return feedItems.map((item, idx) => {
                                                    let component = null;

                                                    if (item.type === 'single') {
                                                        const isTrigger = properties.indexOf(item.data) === properties.length - 5;
                                                        component = (
                                                            <PropertyPost
                                                                property={item.data}
                                                                onVisible={isTrigger ? () => fetchProperties(false) : undefined}
                                                                isFirstInSet={idx === firstPropertyIndex}
                                                                isLastInSet={idx === lastPropertyIndex}
                                                            />
                                                        );
                                                    } else if (item.type === 'ad') {
                                                        component = <AdvertisementCard ad={item.data} />;
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

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden">
                <BottomNavigation user={user} />
            </div>
        </div>
    );
}

function FeedSkeleton({ hasCarouselAds = true }: { hasCarouselAds?: boolean }) {
    return (
        <div className="w-full flex flex-col">
            {/* Carousel Skeleton - Full Width */}
            {hasCarouselAds && (
                <div className="h-[400px] w-full bg-surface animate-pulse mb-8"></div>
            )}
            
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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
