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
import { PropertyCard } from '@/components/cards/PropertyCard';
import { AdvertisementCard, AdvertisementCarousel } from '@/components/cards/AdvertisementCard';
import { BottomNavigation } from '@/components/menu/BottomNavigation';

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

function GridListingCard({ properties, title, className }: { properties: any[], title: string, className?: string }) {
  return (
    <div className={`grid-listing-card ${className || ''}`}>
      <div className="grid-listing-header">
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary)' }}>{title}</h4>
        <Link href="/explore" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-gold)', textDecoration: 'none' }}>Explore More</Link>
      </div>

      <div className="grid-container">
        {properties.map(p => {
          const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const propertyUrl = `/properties/${slug}-${p.id}`;
          const mainImage = p.images?.[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

          return (
            <Link key={p.id} href={propertyUrl} className="grid-card-item">
              <img src={mainImage} alt="" />
              <div className="grid-card-overlay">
                <div>{p.price.split('.')[0]}</div>
              </div>
            </Link>
          );
        })}
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
              let i = 0;

              while (i < properties.length) {
                const p = properties[i];
                feedItems.push({ type: 'single', data: p });

                const index = feedItems.length - 1;

                if (index === 2 && featuredCollections && featuredCollections.length > 0) feedItems.push({ type: 'featured_collections' });
                if (index === 3) feedItems.push({ type: 'trending_searches' });
                if (index === 5 && properties.length > 6) feedItems.push({ type: 'grid_random' });
                if (index === 7 && featuredProperties && featuredProperties.length > 0) feedItems.push({ type: 'featured_projects' });

                // Ads every 5 items
                if ((index + 1) % 5 === 0 && feedAds.length > 0) {
                  const adIndex = Math.floor((index + 1) / 5) - 1;
                  feedItems.push({ type: 'ad', data: feedAds[adIndex % feedAds.length] });
                }
                i++;
              }

              const getGroupType = (type: string) => {
                if (type === 'single') return 'PROPERTY';
                if (type === 'grid_random') return 'GRID';
                if (type === 'ad') return 'AD';
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
                const isAd = item.type === 'ad';
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
                } else if (item.type === 'featured_collections') {
                  component = <FeaturedCollectionsFeedItem collections={featuredCollections || []} className={groupClass} />;
                } else if (item.type === 'trending_searches') {
                  component = <TrendingSearches searches={trendingSearches || []} className={groupClass} />;
                } else if (item.type === 'grid_random') {
                  const randomProps = [...properties].sort(() => 0.5 - Math.random()).slice(0, 4);
                  component = <GridListingCard properties={randomProps} title="Market Highlights" className={groupClass} />;
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

function PropertyPost({ property, user, onRefresh, onVisible, isCommentsOpen, onToggleComments, className }: { property: any, user: any, onRefresh: () => void, onVisible?: () => void, isCommentsOpen?: boolean, onToggleComments?: () => void, className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // ... (rest of effects) ...

  useEffect(() => {
    if (!onVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onVisible();
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [onVisible]);

  const [commentDraft, setCommentDraft] = React.useState('');
  const [isLiking, setIsLiking] = React.useState(false);
  const [localLikeState, setLocalLikeState] = React.useState<{ isLiked: boolean, count: number } | null>(null);
  const [showCopiedToast, setShowCopiedToast] = React.useState(false);

  // Derived social states
  const isLiked = localLikeState ? localLikeState.isLiked : (user && property.property_likes?.some((l: any) => l.user_id === user.id));
  const likeCount = localLikeState ? localLikeState.count : (property.property_likes?.length || 0);
  const comments = property.comments || [];

  // Reset local state when property prop changes (after onRefresh)
  useEffect(() => {
    setLocalLikeState(null);
  }, [property.property_likes]);

  const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const propertyUrl = `/properties/${slug}-${property.id}`;

  const handleLike = async () => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    // Optimistic Update
    const nextIsLiked = !isLiked;
    const nextCount = nextIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLocalLikeState({ isLiked: nextIsLiked, count: nextCount });

    setIsLiking(true);
    try {
      await toggleLike(property.id);
      onRefresh(); // Sync with server
    } catch (err) {
      setLocalLikeState(null);
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${propertyUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share dismissed or failed', err);
      }
      return;
    }

    const copyToClipboardFallback = () => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 3000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 3000);
      } catch (err) {
        console.error('Failed to copy keys:', err);
        copyToClipboardFallback();
      }
    } else {
      copyToClipboardFallback();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    if (!commentDraft.trim()) return;

    try {
      await addComment(property.id, commentDraft);
      setCommentDraft('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const images = property.images || [];
  const mainImage = images.length > 0
    ? (typeof images[0] === 'string' ? images[0] : images[0].url)
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  return (
    <div ref={containerRef} className={`card ${className || ''}`} style={{ padding: '16px', overflow: 'hidden' }}>
      <div className="property-card-wrapper">
        <div className="property-card-image">
          <Link href={propertyUrl} style={{ display: 'block', width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <img
              src={mainImage}
              alt={property.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Link>
          {images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              fontSize: '0.7rem',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '600'
            }}>
              +{images.length - 1}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <Link href={propertyUrl} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary-light)', lineHeight: '1.3' }}>
                  {property.title}
                </h3>
              </Link>
              <button style={{ background: 'none', border: 'none', padding: '0 0 0 8px', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
            </div>

            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-gold)', marginBottom: '4px' }}>
              {property.price}
            </div>

            {property.specs && (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {property.specs}
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>📍 {property.location}</span>
              <span>•</span>
              <span>{property.timestamp}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <Link href={`/@${property.author_username || property.author}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {property.author_avatar ? (
                  <img src={property.author_avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(property.author_name || property.author || 'A')[0]}
                  </div>
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{property.author_name || property.author}</span>
              </div>
            </Link>

            <div className="property-card-actions">
              <button onClick={handleLike} title="Like" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isLiked ? '#ef4444' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
                {likeCount > 0 && <span style={{ fontWeight: '600' }}>{likeCount}</span>}
              </button>

              <button onClick={() => onToggleComments && onToggleComments()} title="Comment" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>

              <button onClick={handleShare} title="Share" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              </button>

              <div style={{ flex: 1 }}></div>

              <button
                onClick={() => {
                  const phone = property.author_phone || property.contact_phone;
                  if (phone) window.location.href = `tel:${phone}`;
                  else alert("No contact number available.");
                }}
                title="Call Agent"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-primary)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isCommentsOpen && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          {comments.map((c: any) => (
            <div key={c.id} style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.6rem', flexShrink: 0 }}>
                {(c.user?.name || 'U')[0]}
              </div>
              <div>
                <span style={{ fontWeight: '700', marginRight: '6px' }}>{c.user?.name || 'User'}</span>
                <span>{c.content}</span>
              </div>
            </div>
          ))}

          {user && (
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Input
                  type="text"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Write a comment..."
                />
              </div>
              <button type="submit" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', marginTop: '1px' }}>
                Post
              </button>
            </form>
          )}
        </div>
      )}

      {showCopiedToast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)',
          color: 'white', padding: '14px 24px', borderRadius: '16px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.3)',
          fontWeight: '500', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span>✨</span>
          <span>Link copied to clipboard</span>
        </div>
      )}
    </div>
  );
}

