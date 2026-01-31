import React from 'react';
import Link from 'next/link';

// --- Popular Categories Section ---

const categories = [
    { id: 'house', name: 'House', count: 3683, icon: '🏠' },
    { id: 'land', name: 'Land', count: 2009, icon: '🗺️' },
    { id: 'flats', name: 'Flats', count: 94, icon: '🏢' },
    { id: 'office', name: 'Office Space', count: 207, icon: '🏨', active: true },
    { id: 'shop', name: 'Shop Space', count: 23, icon: '🛍️' },
    { id: 'apartment', name: 'Apartment', count: 235, icon: '🏘️' },
];

export const PopularCategories = () => {
    return (
        <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
                Popular Categories
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '20px'
            }}>
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        style={{
                            background: 'white',
                            padding: '32px 20px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxShadow: cat.active ? '0 10px 25px -5px rgba(37, 99, 235, 0.1), 0 8px 10px -6px rgba(37, 99, 235, 0.1)' : 'var(--shadow-sm)',
                            border: cat.active ? '2px solid #3b82f6' : '1px solid var(--color-border)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = cat.active ? '0 10px 25px -5px rgba(37, 99, 235, 0.1), 0 8px 10px -6px rgba(37, 99, 235, 0.1)' : 'var(--shadow-sm)';
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
                ))}
            </div>
        </section>
    );
};

// --- Featured Projects Section ---

const featuredProjects = [
    {
        id: 1,
        title: 'Aakriti Colony',
        category: 'Housing',
        location: 'Hepali Height Budhanilkantha Munici...',
        priceRange: 'Rs. 7.01 Cr - Rs. 7.02 Cr',
        propertiesCount: 2,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 2,
        title: 'Aavash Colony',
        category: 'Housing',
        location: 'Panchetar Tokha Municipality',
        priceRange: 'Rs. 3.62 Cr - Rs. 7 Cr',
        propertiesCount: 8,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 3,
        title: 'Downtown Residency',
        category: 'Housing & Apartment',
        location: 'Dhapakhel Lalitpur Metropolitan Cit...',
        priceRange: 'Price on Call',
        propertiesCount: 5,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 4,
        title: 'Downtown Residency',
        category: 'Housing',
        location: 'Bhaisepati Lalitpur Metropolitan Ci...',
        priceRange: 'Rs. 3.65 Cr - Rs. 5 Cr',
        propertiesCount: 17,
        image: 'https://images.unsplash.com/photo-1512915920307-446f1f4d7f0a?auto=format&fit=crop&w=800&q=80'
    }
];

export const FeaturedProjects = ({ properties = [] }: { properties?: any[] }) => {
    const displayProjects = properties.length > 0 ? properties.filter(p => p.isFeatured) : [];

    // If no real featured projects, show fallback or just the ones we have
    const finalProjects = displayProjects.length > 0 ? displayProjects : [];

    if (finalProjects.length === 0) {
        return (
            <section style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                        Featured Projects
                    </h2>
                </div>
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}>
                    <p>No featured projects have been assigned yet.</p>
                    <Link href="/manage/featured" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', marginTop: '8px', display: 'inline-block' }}>Manage Featured List</Link>
                </div>
            </section>
        );
    }

    return (
        <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                    Featured Projects
                </h2>
                <div style={{ color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '1.5rem' }}>➡️</span>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                {finalProjects.map((p) => {
                    const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const propertyUrl = `/properties/${slug}-${p.id}`;

                    return (
                        <Link key={p.id} href={propertyUrl} style={{ textDecoration: 'none' }}>
                            <div
                                className="card"
                                style={{
                                    padding: '0',
                                    overflow: 'hidden',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    background: 'white',
                                    height: '100%',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ position: 'relative', height: '220px' }}>
                                    <img
                                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                                        alt={p.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        left: '12px',
                                        background: '#e0f2fe',
                                        color: '#0369a1',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        border: '1px solid #bae6fd'
                                    }}>
                                        {p.price}
                                    </div>
                                </div>

                                <div style={{ padding: '20px' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        {p.main_category}
                                    </p>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                                        {p.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '0.9rem' }}>📍</span>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>{p.location}</span>
                                    </div>

                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: '#f1f5f9',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        color: '#475569',
                                        fontWeight: '600'
                                    }}>
                                        {p.commercial_sub_category || 'Premium Listing'}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};
