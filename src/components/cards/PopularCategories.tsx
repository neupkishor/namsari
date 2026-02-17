import React from 'react';
import Link from 'next/link';
import { AutoScrollCarousel } from '@/components/ui';

interface Category {
    id: string;
    name: string;
    count: number;
    icon: string;
}

interface PopularCategoriesProps {
    categories?: Category[];
}

const getIconForCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('house')) return '🏠';
    if (n.includes('land')) return '🗺️';
    if (n.includes('flat')) return '🏢';
    if (n.includes('office')) return '🏨';
    if (n.includes('shop')) return '🛍️';
    if (n.includes('apartment')) return '🏘️';
    return '🏙️';
};

const defaultCategories: Category[] = [
    { id: 'house', name: 'House', count: 3683, icon: '🏠' },
    { id: 'land', name: 'Land', count: 2009, icon: '🗺️' },
    { id: 'flats', name: 'Flats', count: 94, icon: '🏢' },
    { id: 'office', name: 'Office Space', count: 207, icon: '🏨' },
    { id: 'shop', name: 'Shop Space', count: 23, icon: '🛍️' },
    { id: 'apartment', name: 'Apartment', count: 235, icon: '🏘️' },
];

export const PopularCategories: React.FC<PopularCategoriesProps> = ({ categories = defaultCategories }) => {
    // If categories are passed (e.g. from real data), ensure they have icons
    const displayCategories = categories.map(cat => ({
        ...cat,
        icon: cat.icon || getIconForCategory(cat.name)
    }));

    return (
        <section style={{ marginBottom: '0px', marginTop: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-light)', marginBottom: '0px' }}>
                Popular Categories
            </h2>
            <p style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Browse the most searched property types.
            </p>
            <AutoScrollCarousel 
                itemWidth="160px" 
                gap="12px" 
                desktopItemCount={4}
                tabletItemCount={3}
                mobileItemCount={2}
            >
                {displayCategories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/explore?q=${cat.name}`}
                        style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                    >
                        <div
                            style={{
                                background: 'white',
                                padding: '32px 20px',
                                borderRadius: 'var(--radius-card)',
                                textAlign: 'center',
                                boxShadow: 'none',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                transition: 'none',
                                height: '100%'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                            }}
                        >
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: '#f0f7ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                fontSize: '2rem'
                            }}>
                                {cat.icon}
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>{cat.name}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: '700' }}>{cat.count}</p>
                        </div>
                    </Link>
                ))}
            </AutoScrollCarousel>
        </section>
    );
};
