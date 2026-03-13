"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuickActionsCard } from '@/components/cards/QuickActionsCard';
import { PopularCategories } from '@/components/cards/PopularCategories';
import { FeaturedProjects } from '@/components/cards/FeaturedProjects';
import { TrendingSearches } from '@/components/cards/TrendingSearches';
import { FeaturedCollectionsFeedItem } from '@/components/cards/FeaturedCollections';
import { AdvertisementCard, AdvertisementCarousel } from '@/components/cards/AdvertisementCard';
import { BottomNavigation } from '@/components/menu/BottomNavigation';
import { PropertyPost } from '@/components/cards/PropertyFeedCard';

function FeaturedSmallCard({ property }: { property: any }) {
    const images = property.images || [];
    const mainImage = images.length > 0
        ? (typeof images[0] === 'string' ? images[0] : images[0].url)
        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';
    
    const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const propertyUrl = `/properties/${slug}-${property.id}`;
    
    return (
        <Link href={propertyUrl} className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-square overflow-hidden relative">
                <img 
                    src={mainImage} 
                    alt={property.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <div className="text-white font-bold text-xs truncate">
                        रु {property.pricing?.price?.toLocaleString() || property.price?.toLocaleString()}
                    </div>
                </div>
            </div>
            <div className="p-3">
                <h4 className="text-slate-900 font-bold text-xs line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {property.title}
                </h4>
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-blue-600 font-bold text-[10px]">View Details</span>
                </div>
            </div>
        </Link>
    );
}

import { PropertyGrid } from '@/components/ui/PropertyGrid';

export default function HomeClient({ user, featuredCollections, trendingSearches, featuredProperties = [], featuredAgencies = [], advertisements = [], categories = [] }: { user: any, featuredCollections?: any[], trendingSearches?: string[], featuredProperties?: any[], featuredAgencies?: any[], advertisements?: any[], categories?: any[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const [properties, setProperties] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

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
        <div className="bg-[#F8FAFC] min-h-screen">
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

                    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Featured Properties Section (eSewa Style) */}
                        {featuredProperties && featuredProperties.length > 0 && (
                            <section className="w-full mb-16">
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                        Featured Properties
                                    </h2>
                                    <Link href="/explore" className="text-blue-600 text-sm font-bold hover:underline">
                                        View more
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {featuredProperties.slice(0, 5).map((prop: any) => (
                                        <FeaturedSmallCard key={prop.id} property={prop} />
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="w-full mt-12">
                            {/* Feed Content Area - Full Width */}
                            <div className="flex flex-col gap-10">
                                <QuickActionsCard user={user} />
                                
                                <div className="space-y-10">
                                    {/* Sub-header for the feed */}
                                    <div className="flex items-center gap-4 px-2">
                                        <h3 className="text-xl font-black text-text-main tracking-tight flex items-center gap-3">
                                            <span className="w-1.5 h-8 bg-primary rounded-full" />
                                            Market Activity
                                        </h3>
                                        <div className="h-px flex-1 bg-border/60" />
                                    </div>

                                    <div className="flex flex-col gap-4">
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

                                            return feedItems.map((item, idx) => {
                                                let component = null;

                                                if (item.type === 'single') {
                                                    const isTrigger = properties.indexOf(item.data) === properties.length - 5;
                                                    component = (
                                                        <PropertyPost
                                                            property={item.data}
                                                            onVisible={isTrigger ? () => fetchProperties(false) : undefined}
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
                                                You've reached the end of the registry.
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
                    {/* QuickActionsCard Skeleton */}
                    <div className="w-full h-32 bg-surface animate-pulse rounded-2xl"></div>

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


