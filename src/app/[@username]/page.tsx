import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Property, User } from '@prisma/client';
import { getSession } from '@/lib/auth';
import ProfileImageUpload from './ProfileImageUpload';
import { SiteHeader } from '@/components/SiteHeader';
import { PropertyCard } from '@/components/PropertyCard';


interface PageProps {
    params: Promise<{
        '@username': string;
    }>;
}

export default async function ProfilePage({ params }: PageProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    // Fetch data and settings
    const session = await getSession();

    let settings = null;
    if ((prisma as any).systemSettings) {
        try {
            settings = await (prisma as any).systemSettings.findFirst();
        } catch (e) {
            console.error("Profile settings fetch failed:", e);
        }
    }

    if (!settings) {
        settings = {
            view_mode: 'classic',
            show_like_button: true,
            show_share_button: true,
            show_comment_button: true
        };
    }
    const currentUserId = session ? parseInt(session.id) : null;
    const currentUser = currentUserId ? await prisma.user.findUnique({ where: { id: currentUserId } }) : null;

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
            <SiteHeader user={currentUser} />

            {/* Profile Cover & Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <div className="layout-container">
                    <div style={{ height: '240px', background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)', borderRadius: '0 0 16px 16px', position: 'relative' }}>
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
                                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '4px', color: 'var(--color-primary-light)' }}>{user.name}</h1>
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
                            <button style={{ padding: '12px 24px', background: '#f1f5f9', color: 'var(--color-primary-light)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--color-primary-light)' }}>Introduction</h3>
                        <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>
                            {user.bio || `Professional ${user.account_type || 'real estate enthusiast'} dedicated to providing the best property services in the region.`}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '1.2rem' }}>📧</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--color-primary-light)', fontWeight: '500' }}>{user.username}@namsari.com</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '1.2rem' }}>📱</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--color-primary-light)', fontWeight: '500' }}>{user.contact_number || '+977-XXXXXXXXXX'}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '1.2rem' }}>📍</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--color-primary-light)', fontWeight: '500' }}>Kathmandu, Nepal</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '1.2rem' }}>🔗</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--color-primary)', fontWeight: '600' }}>namsari.com/@{user.username}</div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--color-primary-light)' }}>Performance</h3>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                            {enrichedProperties.map((p: any) => (
                                <PropertyCard key={p.id} property={p} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
