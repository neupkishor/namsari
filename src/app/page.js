"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock Data
const properties = [
  {
    id: 1,
    author: "Namsari Properties",
    title: "The Horizon Complex",
    price: "$12,500,000",
    location: "Metropolis East Side",
    specs: "4 Blocks • 240 Units • Commercial Grade",
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&q=80&w=1080",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=1080"
    ],
    type: "Commercial Complex",
    likes: "2.4k",
    timestamp: "2h ago"
  },
  {
    id: 2,
    author: "Premier Asset Management",
    title: "The Sterling Heights",
    price: "$8,200,000",
    location: "Downtown Core",
    specs: "Luxury Condos • Full Amenities • 60 Units",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1080"
    ],
    type: "Residential Development",
    likes: "1.5k",
    timestamp: "5h ago"
  },
  {
    id: 3,
    author: "Skyline Estates",
    title: "Skyline Executive Penthouse",
    price: "$6,800,000",
    location: "Financial District",
    specs: "4 Beds • 5 Baths • Private Heliport Access",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1080"
    ],
    type: "Residential Luxury",
    likes: "890",
    timestamp: "1d ago"
  }
];

export default function Home() {
  const [viewType, setViewType] = useState('card');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('namsari-home-view');
    if (saved) setViewType(saved);

    // Simulate premium loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
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
          <nav style={{ display: 'flex', gap: '32px', fontWeight: '500', fontSize: '0.9rem', alignItems: 'center' }}>
            <a href="#">Explore</a>
            <a href="#">Map</a>
            <Link href="/manage" style={{ background: 'var(--color-primary)', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>
              Management
            </Link>
          </nav>
        </div>
      </header>

      {isLoading ? (
        viewType === 'card' ? <ClassicSkeleton /> : <FeedSkeleton />
      ) : (
        viewType === 'card' ? <ClassicView /> : <FeedView />
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

function ClassicView() {
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
              <img src={p.images[0]} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
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

function FeedView() {
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

  return (
    <div className="layout-container" style={{ display: 'flex', gap: '40px', paddingTop: '40px', paddingBottom: '100px' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (min-width: 1025px) {
          .feed-sidebar-desktop { display: block !important; }
        }
      `}} />

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

function PropertyPost({ property }) {
  const scrollRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollTo = (index) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="card" style={{ padding: '0', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden', background: 'white' }}>
      {/* Post Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          {property.author[0]}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{property.author}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{property.location} • {property.timestamp}</div>
        </div>
      </div>

      {/* Post Media Carousel Container */}
      <div style={{ position: 'relative', background: '#000' }}>
        {/* Navigation Arrows */}
        {property.images.length > 1 && (
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
            {activeIndex < property.images.length - 1 && (
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

          {property.images.map((imgUrl, imgIndex) => (
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
        </div>

        {/* Indicators Panel */}
        {property.images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            pointerEvents: 'none'
          }}>
            {property.images.map((_, i) => (
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
        {property.images.length > 1 && (
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(0, 0, 0, 0.6)', color: 'white',
            padding: '4px 10px', borderRadius: '12px',
            fontSize: '0.7rem', fontWeight: '700', zIndex: '5'
          }}>
            {activeIndex + 1} / {property.images.length}
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
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>View all 42 inquiries</div>
      </div>
    </div>
  );
}
