"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { logoutAction } from './actions/auth';

export default function Home({ user }: { user: any }) {
  const [viewType, setViewType] = useState('card');
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('namsari-home-view');
    if (saved) setViewType(saved);

    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/properties');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProperties(data);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <main style={{ backgroundColor: viewType === 'feed' ? '#f0f2f5' : '#ffffff', minHeight: '100vh' }}>
      {/* Shared Responsive Logic for Feed Sidebar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (min-width: 1025px) {
          .feed-sidebar-desktop { display: block !important; }
        }
      `}} />

      <header className="full-width-header" style={{ background: '#ffffff' }}>
        <div className="layout-container header-content">
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            Namsari<span style={{ color: 'var(--color-gold)', marginLeft: '1px' }}>.</span>
          </Link>
          <nav style={{ display: 'flex', gap: '24px', fontWeight: '500', fontSize: '0.9rem', alignItems: 'center' }}>
            <a href="#" style={{ color: 'var(--color-text-muted)' }}>Explore</a>
            <Link href="/sell" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Sell</Link>

            {!user ? (
              <>
                <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Sign In</Link>
                <Link href="/register" style={{ background: 'var(--color-primary)', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>
                  Register
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link href="/manage" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                  {user.name}
                </Link>
                <button
                  onClick={() => logoutAction()}
                  style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {isLoading ? (
        viewType === 'card' ? <ClassicSkeleton /> : <FeedSkeleton />
      ) : (
        viewType === 'card' ? <ClassicView properties={properties} /> : <FeedView properties={properties} />
      )}
    </main>
  );
}

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
      <div style={{ flex: 1, maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px', margin: '0 auto' }}>
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

function ClassicView({ properties }: { properties: any[] }) {
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
          <h1 style={{ fontSize: '3.5rem', marginBottom: '20px' }}>Institutional Real Estate.</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.25rem' }}>The premier marketplace for premium residential and commercial assets.</p>
        </div>
      </section>
      <div className="layout-container" style={{ paddingBottom: '100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
          {properties.map(p => (
            <div key={p.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <img src={p.images?.[0] || 'https://via.placeholder.com/400x240'} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '8px' }}>{p.title}</h3>
                <p style={{ color: 'var(--color-gold)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '8px' }}>{p.price}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{p.location}</p>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                  {p.specs}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function FeedView({ properties }: { properties: any[] }) {
  const sidebarItems = [
    { label: 'Profile', icon: '👤' },
    { label: 'Houses', icon: '🏠' },
    { label: 'Commercial Buildings', icon: '🏢' },
    { label: 'Saved Estates', icon: '🔖' },
    { label: 'Market Trends', icon: '📈' },
  ];

  const secondaryItems = [
    { label: 'Settings', icon: '⚙️' },
    { label: 'Help Center', icon: '❓' },
    { label: 'Privacy', icon: '🛡️' },
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
            <div key={idx} style={{
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
          ))}

          <div style={{ margin: '16px 0', height: '1px', background: 'rgba(0,0,0,0.05)' }} />

          {secondaryItems.map((item, idx) => (
            <div key={idx} style={{
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
          ))}

          <div style={{ padding: '20px 16px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Namsari Estate &copy; 2026<br />A Neup Group Standard
          </div>
        </div>
      </aside>

      {/* Main Social Feed */}
      <div style={{ flex: 1, maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px', margin: '0 auto' }}>
        {properties.map((p) => (
          <PropertyPost key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}

function PropertyPost({ property }: { property: any }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

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

  const images = property.images || [];

  return (
    <div className="card" style={{ padding: '0', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden', background: 'white' }}>
      {/* Post Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          {(property.author || 'A')[0]}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{property.author}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{property.location} • {property.timestamp}</div>
        </div>
      </div>

      {/* Post Media Carousel Container */}
      <div style={{ position: 'relative', background: '#000' }}>
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            {activeIndex > 0 && (
              <button
                onClick={() => scrollTo(activeIndex - 1)}
                style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', color: '#000'
                }}>‹</button>
            )}
            {activeIndex < images.length - 1 && (
              <button
                onClick={() => scrollTo(activeIndex + 1)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', color: '#000'
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
          <style dangerouslySetInnerHTML={{
            __html: `
            div::-webkit-scrollbar { display: none; }
          `}} />

          {images.map((imgUrl: string, imgIndex: number) => (
            <div key={imgIndex} style={{
              minWidth: '100%',
              scrollSnapAlign: 'start',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc'
            }}>
              <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ))}
          {images.length === 0 && (
            <div style={{ minWidth: '100%', height: '400px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              No Images Available
            </div>
          )}
        </div>

        {/* Indicators Panel */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            pointerEvents: 'none'
          }}>
            {images.map((_: any, i: number) => (
              <div key={i} style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: i === activeIndex ? 'white' : 'rgba(255,255,255,0.4)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                transition: 'all 0.2s',
                transform: i === activeIndex ? 'scale(1.2)' : 'scale(1)'
              }} />
            ))}
          </div>
        )}

        {/* Status Count Tag */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(0, 0, 0, 0.6)', color: 'white',
            padding: '4px 10px', borderRadius: '12px',
            fontSize: '0.7rem', fontWeight: '700', zIndex: '5'
          }}>
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Post Feed Actions */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          <span style={{ cursor: 'pointer', fontSize: '1.25rem' }}>❤️</span>
          <span style={{ cursor: 'pointer', fontSize: '1.25rem' }}>💬</span>
          <span style={{ cursor: 'pointer', fontSize: '1.25rem' }}>✈️</span>
        </div>
        <div style={{ fontWeight: '700', marginBottom: '4px' }}>{property.likes} likes</div>
        <div style={{ fontSize: '1rem', marginBottom: '8px' }}>
          <span style={{ fontWeight: '700', marginRight: '8px' }}>{property.author}</span>
          <span style={{ fontWeight: '600', color: 'var(--color-gold)' }}>{property.price}</span> — {property.title}. {property.specs}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>View all inquiries</div>
      </div>
    </div>
  );
}
