"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toggleLike, addComment } from '@/actions/social';
import { Input } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { QuickActionsCard } from '@/components/cards/QuickActionsCard';
import { PopularCategories } from '@/components/cards/PopularCategories';
import { FeaturedProjects } from '@/components/cards/FeaturedProjects';
import { TrendingSearches } from '@/components/cards/TrendingSearches';
import { PostPropertyBanner } from '@/components/PostPropertyBanner';
import { FeaturedCollectionsSection, FeaturedCollectionsFeedItem } from '@/components/cards/FeaturedCollections';
import { AdvertisementCard, AdvertisementCarousel } from '@/components/cards/AdvertisementCard';
import { BottomNavigation } from '@/components/menu/BottomNavigation';
import { PropertyPost } from '@/components/cards/PropertyFeedCard';

export default function Home({ user, featuredCollections, trendingSearches, featuredProperties = [], featuredAgencies = [], advertisements = [] }: { user: any, featuredCollections?: any[], trendingSearches?: string[], featuredProperties?: any[], featuredAgencies?: any[], advertisements?: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [properties, setProperties] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

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
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Check if the page is loading content */}
      {isLoading ? (
        <FeedSkeleton />
      ) : (
        <FeedView properties={properties} user={user} onRefresh={() => fetchProperties(true)} onLoadMore={() => fetchProperties(false)} isFetchingMore={isFetchingMore} hasMore={hasMore} featuredCollections={featuredCollections} trendingSearches={trendingSearches} featuredProperties={featuredProperties} featuredAgencies={featuredAgencies} advertisements={advertisements} />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="mobile-only">
        <BottomNavigation user={user} />
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="layout-container" style={{ display: 'flex', gap: '40px', paddingTop: '40px' }}>
      {/* Feed Content Skeleton */}
      <div style={{ flex: 1, maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)', margin: '0 auto' }}>
        {[1, 2].map(i => (
          <div key={i} className="card" style={{ padding: '0', height: '600px', borderRadius: '8px' }}>
            <div style={{ padding: '12px 16px', display: 'flex', gap: '12px' }}>
              <div className="skeleton skeleton-circle" style={{ width: '40px', height: '40px' }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: '1rem', width: '30%', marginBottom: '4px' }}></div>
                <div className="skeleton" style={{ height: '0.75rem', width: '20%' }}></div>
              </div>
            </div>
            <div className="skeleton" style={{ height: '400px', width: '100%' }}></div>
            <div style={{ padding: '16px' }}>
              <div className="skeleton" style={{ height: '1rem', width: '20%', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ height: '1.5rem', width: '80%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



function FeedView({ properties, user, onRefresh, onLoadMore, isFetchingMore, hasMore, featuredCollections, trendingSearches, featuredProperties, featuredAgencies, advertisements = [] }: { properties: any[], user: any, onRefresh: () => void, onLoadMore: () => void, isFetchingMore: boolean, hasMore: boolean, featuredCollections?: any[], trendingSearches?: string[], featuredProperties?: any[], featuredAgencies?: any[], advertisements?: any[] }) {
  const [activeCommentPostId, setActiveCommentPostId] = React.useState<number | null>(null);

  const carouselAds = advertisements?.filter(ad => ad.shows_on_top) || [];
  const feedAds = advertisements?.filter(ad => !ad.shows_on_top) || [];

  if (!properties || properties.length === 0) {
    return (
      <div className="layout-container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h3>The feed is empty.</h3>
        <Link href="/sell" style={{ color: 'var(--color-primary)' }}>Start the conversation by listing a property.</Link>
      </div>
    );
  }

  return (
    <div className="layout-container" style={{ display: 'flex', gap: '40px', paddingTop: '0px', paddingBottom: '120px', alignItems: 'flex-start' }}>
      <div className="feed-main-content" style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        minWidth: 0
      }}>
        <div style={{
          width: '100%',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--card-gap)'
        }}>
          <QuickActionsCard user={user} />
          
          <PopularCategories />

          {/* Top Carousel Advertisement */}
          {carouselAds.length > 0 && (
            <div style={{ marginTop: '0px', marginBottom: '0px' }}>
              <AdvertisementCarousel ads={carouselAds} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', marginTop: '16px' }}>
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
              
              // Helper to add an ad deterministically
              const addAd = (seedIndex: number) => {
                  if (feedAds.length === 0) return;
                  
                  // Deterministic choice for carousel (e.g., every 3rd insertion if we have enough ads)
                  // Use seedIndex to decide. 
                  // If seedIndex % 3 === 2 (0, 1, 2...), show carousel
                  const isCarousel = (seedIndex % 3 === 2);
                  
                  if (isCarousel && feedAds.length > 1) {
                      // Deterministic selection based on seed
                      const start = (seedIndex * 2) % feedAds.length;
                      // Create a deterministic shuffled-like list by concatenating and slicing
                      const carouselAds = [...feedAds, ...feedAds].slice(start, start + 5);
                      feedItems.push({ type: 'ad_carousel', data: carouselAds });
                  } else {
                      const adIndex = seedIndex % feedAds.length;
                      feedItems.push({ type: 'ad', data: feedAds[adIndex] });
                  }
              };

              // --- BLOCK: 5 Properties + 1 Ad + 1 Cyclic Card ---
              while (propertyIndex < properties.length) {
                  const chunkCount = Math.min(5, properties.length - propertyIndex);
                  for (let i = 0; i < chunkCount; i++) {
                      feedItems.push({ type: 'single', data: properties[propertyIndex++] });
                  }
                  
                  // Only add extras if we actually added properties in this chunk
                  if (chunkCount > 0) {
                      addAd(insertionCount);
                      
                      if (validCardTypes.length > 0) {
                          const cardType = validCardTypes[insertionCount % validCardTypes.length];
                          feedItems.push({ type: cardType });
                      }
                      
                      insertionCount++;
                  }
              }

              const getGroupType = (type: string) => {
                if (type === 'single') return 'PROPERTY';
                if (type === 'grid_random') return 'GRID';
                if (type === 'ad' || type === 'ad_carousel') return 'AD';
                if (['featured_agencies', 'featured_collections', 'featured_projects'].includes(type)) return 'FEATURED';
                if (type === 'trending_searches') return 'TRENDING';
                return type;
              };

              return feedItems.map((item, idx) => {
                const currentGroupType = getGroupType(item.type);
                const prevItem = feedItems[idx - 1];
                const nextItem = feedItems[idx + 1];
                const prevGroupType = prevItem ? getGroupType(prevItem.type) : null;
                const nextGroupType = nextItem ? getGroupType(nextItem.type) : null;

                const isFirstInGroup = currentGroupType !== prevGroupType;
                const isLastInGroup = currentGroupType !== nextGroupType;

                const groupClass = isFirstInGroup && isLastInGroup
                  ? ''
                  : isFirstInGroup
                    ? 'group-top'
                    : isLastInGroup
                      ? 'group-bottom'
                      : 'group-middle';

                // Explicitly adding margin for ads
                const isAd = item.type === 'ad' || item.type === 'ad_carousel';
                const marginTop = isAd ? '24px' : (isFirstInGroup && idx > 0 ? (isFirstInGroup && isLastInGroup ? '16px' : '24px') : '0px');

                let component = null;

                if (item.type === 'single') {
                  const isTrigger = properties.indexOf(item.data) === properties.length - 5;
                  component = (
                    <PropertyPost
                      property={item.data}
                      user={user}
                      onRefresh={onRefresh}
                      onVisible={isTrigger ? onLoadMore : undefined}
                      isCommentsOpen={activeCommentPostId === item.data.id}
                      onToggleComments={() => setActiveCommentPostId(activeCommentPostId === item.data.id ? null : item.data.id)}
                      className={groupClass}
                    />
                  );
                } else if (item.type === 'ad') {
                  component = <AdvertisementCard ad={item.data} className={groupClass} />;
                } else if (item.type === 'ad_carousel') {
                  component = <AdvertisementCarousel ads={item.data} />;
                } else if (item.type === 'featured_collections') {
                  component = <FeaturedCollectionsFeedItem collections={featuredCollections || []} className={groupClass} />;
                } else if (item.type === 'trending_searches') {
                  component = <TrendingSearches searches={trendingSearches || []} className={groupClass} />;
                } else if (item.type === 'featured_projects') {
                  component = <FeaturedProjects properties={featuredProperties || []} className={groupClass} />;
                }

                return (
                  <div key={`${item.type}-${idx}`} style={{ marginTop }}>
                    {component}
                  </div>
                );
              });
            })()}
          </div>

        {isFetchingMore && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
            🔄 Loading more premium assets...
          </div>
        )}

        {!hasMore && properties.length > 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            You've reached the end of the registry.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}



