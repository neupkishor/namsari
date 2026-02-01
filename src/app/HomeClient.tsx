"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { logoutAction } from './actions/auth';
import { toggleLike, addComment } from './actions/social';
import { Input } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { QuickActionsCard } from '@/components/QuickActionsCard';
import { PopularCategories, FeaturedProjects } from '@/components/HomeSections';
import { TrendingSearches } from '@/components/TrendingSearches';
import { PostPropertyBanner } from '@/components/PostPropertyBanner';
import { FeaturedAgenciesClassic, FeaturedAgenciesFeed } from '@/components/FeaturedAgencies';
import { FeaturedCollectionsSection, FeaturedCollectionsFeedItem } from '@/components/FeaturedCollections';
import { SiteHeader } from '@/components/SiteHeader';

export default function Home({ user, settings, featuredCollections, trendingSearches }: { user: any, settings: any, featuredCollections?: any[], trendingSearches?: string[] }) {
  const router = useRouter();
  const viewType = settings?.view_mode || 'classic';
  const [isLoading, setIsLoading] = useState(true);

  // Toggle footer visibility based on view type
  useEffect(() => {
    if (viewType === 'social') {
      document.body.classList.add('footer-hidden');
    } else {
      document.body.classList.remove('footer-hidden');
    }
    return () => document.body.classList.remove('footer-hidden');
  }, [viewType]);

  const [properties, setProperties] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchProperties = async (reset = false) => {
    if (!reset && (!hasMore || isFetchingMore)) return;

    if (reset) {
      setIsLoading(true);
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
    <main style={{ backgroundColor: viewType === 'social' ? '#f0f2f5' : '#ffffff', minHeight: '100vh' }}>
      {/* Shared Responsive Logic for Feed Sidebar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (min-width: 1025px) {
          .feed-sidebar-desktop { display: block !important; }
        }
      `}} />

      <SiteHeader user={user} />

      {isLoading ? (
        viewType === 'classic' ? <ClassicSkeleton /> : <FeedSkeleton />
      ) : (
        viewType === 'classic' ? <ClassicView properties={properties} featuredCollections={featuredCollections} trendingSearches={trendingSearches} user={user} /> : <FeedView properties={properties} user={user} settings={settings} onRefresh={() => fetchProperties(true)} onLoadMore={() => fetchProperties(false)} isFetchingMore={isFetchingMore} hasMore={hasMore} featuredCollections={featuredCollections} trendingSearches={trendingSearches} />
      )}
    </main>
  );
}

// ... skeletons ...

function ClassicSkeleton() {
  return (
    <div className="layout-container" style={{ paddingTop: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div className="skeleton" style={{ height: '4rem', width: '60%', margin: '0 auto 20px' }}></div>
        <div className="skeleton" style={{ height: '1.5rem', width: '40%', margin: '0 auto' }}></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card skeleton-card" style={{ padding: '0', height: '400px' }}>
            <div className="skeleton" style={{ height: '240px', width: '100%' }}></div>
            <div style={{ padding: '24px' }}>
              <div className="skeleton" style={{ height: '1.5rem', width: '70%', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ height: '1.25rem', width: '40%', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ height: '1rem', width: '90%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="layout-container" style={{ display: 'flex', gap: '40px', paddingTop: '40px' }}>
      {/* Sidebar Skeleton - Responsive */}
      <aside className="feed-sidebar-desktop" style={{ width: '240px', flexShrink: 0, display: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: '48px', width: '100%', borderRadius: '8px' }}></div>
          ))}
          <div style={{ margin: '16px 0', height: '1px', background: 'rgba(0,0,0,0.05)' }} />
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: '40px', width: '80%', borderRadius: '8px' }}></div>
          ))}
        </div>
      </aside>

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


function ClassicView({ properties, featuredCollections, trendingSearches, user }: { properties: any[], featuredCollections?: any[], trendingSearches?: string[], user?: any }) {
  if (!properties || properties.length === 0) {
    return (
      <div className="layout-container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h3>No listings found.</h3>
        <Link href="/sell" style={{ color: 'var(--color-primary)' }}>Create the first one!</Link>
      </div>
    );
  }

  return (
    <>
      <section style={{ padding: '80px 0', background: 'white', textAlign: 'center' }}>
        <div className="layout-container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '700' }}>Institutional Real Estate.</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.25rem', marginBottom: '48px' }}>The premier marketplace for premium residential and commercial assets.</p>

          <QuickActionsCard user={user} />
        </div>
      </section>

      <div className="layout-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
        <PopularCategories />
        {featuredCollections && featuredCollections.length > 0 && <FeaturedCollectionsSection collections={featuredCollections} />}
        <FeaturedProjects properties={properties} />
        <PostPropertyBanner />
        <TrendingSearches searches={trendingSearches || []} />
        <FeaturedAgenciesClassic />
      </div>

      <div className="layout-container" style={{ paddingBottom: '100px', marginTop: 'var(--card-gap)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10172A', marginBottom: '24px' }}>Latest Listings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
          {properties.map(p => {
            const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const pUrl = `/properties/${slug}-${p.id}`;
            return (
              <div key={p.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <Link href={pUrl} style={{ display: 'block' }}>
                  <img src={p.images?.[0] || 'https://via.placeholder.com/400x240'} style={{ width: '100%', height: '240px', objectFit: 'cover', cursor: 'pointer' }} />
                </Link>
                <div style={{ padding: '24px' }}>
                  <Link href={pUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{ marginBottom: '8px', cursor: 'pointer' }}>{p.title}</h3>
                  </Link>
                  <p style={{ color: 'var(--color-gold)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '8px' }}>{p.price}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{p.location}</p>
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                    {p.specs}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function FeedView({ properties, user, settings, onRefresh, onLoadMore, isFetchingMore, hasMore, featuredCollections, trendingSearches }: { properties: any[], user: any, settings: any, onRefresh: () => void, onLoadMore: () => void, isFetchingMore: boolean, hasMore: boolean, featuredCollections?: any[], trendingSearches?: string[] }) {
  const sidebarItems = [
    { label: 'Profile', icon: '👤', href: user ? `/@${user.username}` : '/login' },
    { label: 'Houses', icon: '🏠', href: '/find/houses' },
    { label: 'Commercial Buildings', icon: '🏢', href: '/find/commercial-buildings' },
    { label: 'Favourites', icon: '❤️', href: '/profile/favourites' },
    { label: 'Market Trends', icon: '📈', href: '/market' },
  ];

  const secondaryItems = [
    { label: 'Settings', icon: '⚙️', href: '/manage/settings' },
    { label: 'Help Center', icon: '❓', href: '/support' },
    { label: 'Privacy', icon: '🛡️', href: '/terms/privacy' },
  ];

  if (!properties || properties.length === 0) {
    return (
      <div className="layout-container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h3>The feed is empty.</h3>
        <Link href="/sell" style={{ color: 'var(--color-primary)' }}>Start the conversation by listing a property.</Link>
      </div>
    );
  }

  return (
    <div className="layout-container" style={{ display: 'flex', gap: '40px', paddingTop: '40px', paddingBottom: '100px' }}>
      {/* Social Media Style Sidebar */}
      <aside className="feed-sidebar-desktop" style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '112px', height: 'fit-content', display: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sidebarItems.map((item, idx) => (
            <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: idx === 0 ? '700' : '500',
                color: 'var(--color-primary)',
                transition: 'background 0.2s'
              }} onMouseOver={(e) => e.currentTarget.style.background = '#e4e6eb'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}

          <div style={{ margin: '16px 0', height: '1px', background: 'rgba(0,0,0,0.05)' }} />

          {secondaryItems.map((item, idx) => (
            <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
                transition: 'background 0.2s'
              }} onMouseOver={(e) => e.currentTarget.style.background = '#f0f2f5'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}

          <div style={{ margin: '16px 0', height: '1px', background: 'rgba(0,0,0,0.05)' }} />

          {/* Logout Option */}
          {user && (
            <div
              onClick={() => logoutAction()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#ef4444',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.1rem' }}>🚪</span>
              <span>Logout</span>
            </div>
          )}

          <div style={{ padding: '20px 16px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Namsari Estate &copy; 2026<br />A Neup Group Standard
          </div>
        </div>
      </aside>

      {/* Main Social Feed */}
      <div style={{ flex: 1, maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)', margin: '0 auto' }}>
        <QuickActionsCard user={user} />

        {properties.flatMap((p, index) => {
          const isTrigger = index === properties.length - 5;
          const items = [
            <PropertyPost
              key={p.id}
              property={p}
              user={user}
              settings={settings}
              onRefresh={onRefresh}
              onVisible={isTrigger ? onLoadMore : undefined}
            />
          ];

          if (index === 0) {
            items.push(<FeaturedAgenciesFeed key="featured-agencies" />);
          }

          if (index === 2 && featuredCollections && featuredCollections.length > 0) {
            items.push(<FeaturedCollectionsFeedItem key="featured-collections" collections={featuredCollections} />);
          }


          if (index === 3) {
            items.push(<TrendingSearches key="trending-searches" searches={trendingSearches || []} />);
          }

          return items;
        })}

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
  );
}

function PropertyPost({ property, user, settings, onRefresh, onVisible }: { property: any, user: any, settings: any, onRefresh: () => void, onVisible?: () => void }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [showComments, setShowComments] = React.useState(false);
  const [commentDraft, setCommentDraft] = React.useState('');
  const [isLiking, setIsLiking] = React.useState(false);

  // Derived social states
  const isLiked = user && property.property_likes?.some((l: any) => l.user_id === user.id);
  const likeCount = property.property_likes?.length || 0;
  const comments = property.comments || [];

  const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const propertyUrl = `/properties/${slug}-${property.id}`;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;
    const width = target.offsetWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth'
      });
    }
  };

  const handleLike = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setIsLiking(true);
    try {
      await toggleLike(property.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${propertyUrl}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Property link copied to clipboard!");
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
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

  return (
    <div ref={containerRef} className="card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Post Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href={`/@${property.author_username || property.author}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {property.author_avatar && property.author_avatar.length > 2 ? (
            <img
              src={property.author_avatar}
              alt={property.author_name}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
            />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {(property.author_name || property.author || 'A')[0]}
            </div>
          )}
        </Link>
        <div style={{ flex: 1 }}>
          <Link href={`/@${property.author_username || property.author}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{property.author_name || property.author}</div>
          </Link>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{property.location} • {property.timestamp}</div>
        </div>
      </div>

      <div style={{ padding: '0 16px 12px', fontSize: '0.975rem', lineHeight: '1.4' }}>
        <span style={{ fontWeight: '600', color: 'var(--color-gold)', marginRight: '6px' }}>{property.price}</span>
        <Link href={propertyUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ cursor: 'pointer' }}>{property.title}. {property.specs}</span>
        </Link>
      </div>

      {/* Post Media Carousel Container */}
      <div style={{ position: 'relative', background: '#000' }}>
        {images.length > 1 && (
          <>
            {activeIndex > 0 && (
              <button
                onClick={() => scrollTo(activeIndex - 1)}
                style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#000'
                }}>‹</button>
            )}
            {activeIndex < images.length - 1 && (
              <button
                onClick={() => scrollTo(activeIndex + 1)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#000'
                }}>›</button>
            )}
          </>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}>
          <style dangerouslySetInnerHTML={{ __html: `div::-webkit-scrollbar { display: none; }` }} />

          {images.map((imgUrl: string, imgIndex: number) => (
            <div key={imgIndex} style={{ minWidth: '100%', scrollSnapAlign: 'start', height: '400px', background: '#f8fafc' }}>
              <Link href={propertyUrl} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Post Feed Actions */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: (showComments || comments.length > 0) ? '1px solid #f1f5f9' : 'none',
          paddingBottom: '8px'
        }}>
          {(() => {
            const result: any[] = [];

            // Set 1: Social
            if (settings?.show_like_button !== false || settings?.show_comment_button !== false) {
              result.push(
                <div key="set1" style={{ display: 'flex', gap: '4px' }}>
                  {settings?.show_like_button !== false && (
                    <ActionButton
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "#ef4444" : "none"} stroke={isLiked ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>}
                      label="Like"
                      count={likeCount}
                      active={isLiked}
                      onClick={handleLike}
                    />
                  )}
                  {settings?.show_comment_button !== false && (
                    <ActionButton
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>}
                      label="Comment"
                      count={comments.length}
                      onClick={() => setShowComments(!showComments)}
                    />
                  )}
                </div>
              );
            }

            // Set 2: Real Estate Actions
            if (settings?.show_contact_agent !== false || settings?.show_make_offer !== false) {
              result.push(
                <div key="set2" style={{ display: 'flex', gap: '4px' }}>
                  {settings?.show_contact_agent !== false && (
                    <ActionButton
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"></path></svg>}
                      label="Contact"
                    />
                  )}
                  {settings?.show_make_offer !== false && (
                    <ActionButton
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>}
                      label="Offer"
                    />
                  )}
                </div>
              );
            }

            // Set 3: Share
            if (settings?.show_share_button !== false) {
              result.push(
                <div key="set3" style={{ display: 'flex', gap: '4px' }}>
                  <ActionButton
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>}
                    label="Share"
                    onClick={handleShare}
                  />
                </div>
              );
            }

            return result;
          })()}
        </div>

        {/* Comment Section */}
        {(showComments || comments.length > 0) && (
          <div style={{ marginTop: '12px' }}>
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
      </div>
    </div>
  );
}

function ActionButton({ icon, label, count, active = false, onClick }: { icon: React.ReactNode, label: string, count?: number, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      background: 'white',
      border: '1px solid #e2e8f0',
      padding: '8px 10px',
      borderRadius: '8px',
      cursor: 'pointer',
      color: active ? '#ef4444' : '#1e293b',
      fontSize: '0.825rem',
      fontWeight: '600',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    }} onMouseOver={(e) => {
      e.currentTarget.style.background = '#f8fafc';
      e.currentTarget.style.borderColor = '#cbd5e1';
    }} onMouseOut={(e) => {
      e.currentTarget.style.background = 'white';
      e.currentTarget.style.borderColor = '#e2e8f0';
    }}>
      <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span>{label}{count !== undefined && count > 0 ? ` ${count}` : ''}</span>
    </button>
  );
}

