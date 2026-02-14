import React from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    count: number;
    icon: string;
}

interface PopularCategoriesProps {
    categories?: Category[];
}

const defaultCategories: Category[] = [
    { id: 'house', name: 'House', count: 3683, icon: '🏠' },
    { id: 'land', name: 'Land', count: 2009, icon: '🗺️' },
    { id: 'flats', name: 'Flats', count: 94, icon: '🏢' },
    { id: 'office', name: 'Office Space', count: 207, icon: '🏨' },
    { id: 'shop', name: 'Shop Space', count: 23, icon: '🛍️' },
    { id: 'apartment', name: 'Apartment', count: 235, icon: '🏘️' },
];

export const PopularCategories: React.FC<PopularCategoriesProps> = ({ categories = defaultCategories }) => {
    return (
        <section style={{ marginBottom: '0px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-light)', marginBottom: '24px' }}>
                Popular Categories
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '20px'
            }}>
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/explore?q=${cat.name}`}
                        style={{ textDecoration: 'none' }}
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
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = '#3b82f6';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
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
            </div>
        </section>
    );
};
