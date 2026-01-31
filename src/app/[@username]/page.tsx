import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import HomeClient from '../HomeClient';
import { Property, User } from '@prisma/client';
import { getSession } from '@/lib/auth';
import ProfileImageUpload from './ProfileImageUpload';

interface PageProps {
    params: Promise<{
        '@username': string;
    }>;
}

export default async function ProfilePage({ params }: PageProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    // Decode the username (it comes as %40username from the URL /@username)
    let decoded = decodeURIComponent(username);

    // Strictly require @ prefix for profile routes
    if (!decoded.startsWith('@')) {
        return notFound();
    }

    // Strip the @ for database lookup
    decoded = decoded.substring(1);

    // Find user by username
    const user = await prisma.user.findUnique({
        where: { username: decoded }
    });

    if (!user) {
        return (
            <div className="layout-container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h1>User not found</h1>
                <p>The user @{decoded} does not exist.</p>
                <Link href="/" style={{ color: 'var(--color-primary)' }}>Return Home</Link>
            </div>
        );
    }

    // Fetch data and settings
    const [session, settings] = await Promise.all([
        getSession(),
        (prisma as any).systemSettings.findFirst()
    ]);
    const isOwner = session?.id === user.id.toString();

    // Fetch user's properties with relations
    const properties = await prisma.property.findMany({
        where: { listedById: user.id },
        orderBy: { created_on: 'desc' },
        include: {
            listedBy: true,
            pricing: true,
            location: true,
            images: true,
            types: true,
            features: true,
            property_likes: true
        }
    });

    // Enriched properties for the view
    const enrichedProperties = properties.map((p) => {
        const priceValue = p.pricing?.price || 0;
        const formattedPrice = new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            maximumFractionDigits: 0
        }).format(Number(priceValue)).replace('NPR', 'NRs.');

        const locationStr = p.location
            ? `${p.location.area}, ${p.location.district}`
            : 'Unspecified';

        const mainCategory = p.types && p.types.length > 0
            ? p.types[0].name.charAt(0).toUpperCase() + p.types[0].name.slice(1)
            : 'Other';

        const specs = p.features
            ? `${p.features.bedrooms || 0}BHK • ${p.features.bathrooms || 0} Bath • ${p.features.builtUpArea || 0} ${p.features.builtUpAreaUnit || ''}`
            : 'Details unspecified';

        return {
            ...p,
            price: formattedPrice,
            location: locationStr,
            images: p.images.map(img => img.url),
            main_category: mainCategory,
            specs: specs,
            likes_count: p.property_likes?.length || 0,
            author_username: user.username,
            author_name: user.name,
            author_avatar: (user as any).profile_picture || (user.name || 'U')[0]
        };
    });

    return (
        <main style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <header className="full-width-header" style={{ background: '#ffffff', marginBottom: '0', borderBottom: '1px solid #e2e8f0' }}>
                <div className="layout-container header-content">
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', textDecoration: 'none' }}>
                        Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                    </Link>
                    <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <Link href="/" style={{ color: 'var(--color-text-muted)', fontWeight: '600', textDecoration: 'none' }}>Home</Link>
                        <Link href="/explore" style={{ color: 'var(--color-text-muted)', fontWeight: '600', textDecoration: 'none' }}>Map</Link>
                    </nav>
                </div>
            </header>

            {/* Profile Cover & Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <div className="layout-container">
                    <div style={{ height: '240px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '0 0 16px 16px', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
                            <button style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                                Edit Cover
                            </button>
                        </div>
                    </div>
                    <div style={{ padding: '0 24px', marginTop: '-80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
                            <ProfileImageUpload
                                userId={user.id}
                                currentImage={(user as any).profile_picture}
                                userName={user.name}
                                isOwner={isOwner}
                            />
                            <div style={{ paddingBottom: '16px' }}>
                                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '4px', color: '#1e293b' }}>{user.name}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>@{user.username}</span>
                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                                    <span style={{
                                        background: user.account_type === 'agency' ? '#f0f7ff' : '#f8fafc',
                                        color: user.account_type === 'agency' ? '#0284c7' : '#475569',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.025em'
                                    }}>
                                        {user.account_type || 'General User'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{ paddingBottom: '16px', display: 'flex', gap: '12px' }}>
                            <button style={{ padding: '12px 24px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(15, 23, 42, 0.39)' }}>
                                Follow
                            </button>
                            <button style={{ padding: '12px 24px', background: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                                Message
                            </button>
                        </div>
                    </div>

                    {/* Inline Nav */}
                    <div style={{ display: 'flex', gap: '32px', padding: '24px 24px 0' }}>
                        <div style={{ paddingBottom: '16px', borderBottom: '3px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer' }}>Posts</div>
                        <div style={{ paddingBottom: '16px', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>About</div>
                        <div style={{ paddingBottom: '16px', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Reviews</div>
                        <div style={{ paddingBottom: '16px', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Saved</div>
                    </div>
                </div>
            </div>

            <div className="layout-container" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'minmax(0, 360px) minmax(0,1fr)', gap: '24px', paddingBottom: '80px' }}>

                {/* Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: '#1e293b' }}>Introduction</h3>
                        <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>
                            {user.bio || `Professional ${user.account_type || 'real estate enthusiast'} dedicated to providing the best property services in the region.`}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '1.2rem' }}>📧</div>
                                <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}>{user.username}@namsari.com</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '1.2rem' }}>📱</div>
                                <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}>{user.contact_number || '+977-XXXXXXXXXX'}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '1.2rem' }}>📍</div>
                                <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}>Kathmandu, Nepal</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '1.2rem' }}>🔗</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--color-primary)', fontWeight: '600' }}>namsari.com/@{user.username}</div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: '#1e293b' }}>Performance</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>{enrichedProperties.length}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Listings</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>4.9</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Rating</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content (Feed) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {enrichedProperties.length === 0 ? (
                        <div className="card" style={{ padding: '60px 40px', textAlign: 'center', background: 'white' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏘️</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>No active listings</h3>
                            <p style={{ color: 'var(--color-text-muted)', maxWidth: '300px', margin: '0 auto' }}>This user hasn't posted any properties for sale or rent yet.</p>
                        </div>
                    ) : (
                        enrichedProperties.map((p: any) => (
                            <div key={p.id} className="card" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden' }}>
                                            {typeof p.author_avatar === 'string' && p.author_avatar.startsWith('http') ? (
                                                <img src={p.author_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.author_name} />
                                            ) : (
                                                p.author_avatar
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>{p.author_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.location} • {p.timestamp || 'Just now'}</div>
                                        </div>
                                    </div>
                                    <button style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>•••</button>
                                </div>

                                <div style={{ padding: '0 20px 16px' }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                        <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>{p.main_category}</span>
                                        {p.isFeatured && <span style={{ padding: '4px 10px', background: '#fef3c7', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#d97706' }}>FEATURED</span>}
                                    </div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px', color: '#1e293b' }}>{p.title}</h4>
                                    <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.5', margin: '0' }}>{p.specs}</p>
                                </div>

                                <div style={{ height: '480px', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                                    {p.images && p.images.length > 0 ? (
                                        <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>No Image Available</div>
                                    )}
                                    <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--color-gold)', color: 'var(--color-primary)', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                        {p.price}
                                    </div>
                                </div>

                                <div style={{ padding: '16px 20px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderTop: '1px solid #f1f5f9',
                                        paddingTop: '12px'
                                    }}>
                                        {/* Set 1: Social */}
                                        {(settings?.show_like_button !== false || settings?.show_comment_button !== false) && (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {settings?.show_like_button !== false && (
                                                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#1e293b', fontWeight: '600', transition: 'all 0.2s', borderRadius: '8px', fontSize: '0.825rem' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                        Like {p.likes_count > 0 && p.likes_count}
                                                    </button>
                                                )}
                                                {settings?.show_comment_button !== false && (
                                                    <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#1e293b', fontWeight: '600', transition: 'all 0.2s', borderRadius: '8px', fontSize: '0.825rem' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                                        Comment
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Set 2: View Details */}
                                        <div style={{ display: 'flex' }}>
                                            <Link href={`/properties/${p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none', transition: 'all 0.2s', borderRadius: '8px', fontSize: '0.825rem' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
