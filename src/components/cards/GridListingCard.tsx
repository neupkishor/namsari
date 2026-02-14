import React from 'react';
import Link from 'next/link';

interface GridListingCardProps {
  properties: any[];
  title: string;
  className?: string;
}

export function GridListingCard({ properties, title, className }: GridListingCardProps) {
  return (
    <div className={`grid-listing-card ${className || ''}`} style={{
        background: 'white',
        borderRadius: 'var(--radius-card)',
        padding: '20px',
        border: '1px solid var(--color-border)'
    }}>
      <div className="grid-listing-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
      }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary)' }}>{title}</h4>
        <Link href="/explore" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-gold)', textDecoration: 'none' }}>Explore More</Link>
      </div>

      <div className="grid-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
      }}>
        {properties.map(p => {
          const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const propertyUrl = `/properties/${slug}-${p.id}`;
          const mainImage = p.images?.[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

          return (
            <Link key={p.id} href={propertyUrl} className="grid-card-item" style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                aspectRatio: '1/1',
                display: 'block'
            }}>
              <img src={mainImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="grid-card-overlay" style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '8px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '700'
              }}>
                <div>{p.price.split('.')[0]}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
