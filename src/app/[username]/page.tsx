import React from 'react';
import { initMapper } from '@/mapper';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import HomeClient from '../HomeClient';

interface PageProps {
    params: Promise<{
        username: string;
    }>;
}

export default async function ProfilePage({ params }: PageProps) {
    const { username } = await params;

    // Decode the username (it comes as %40username from the URL /@username)
    let decoded = decodeURIComponent(username);

    // Check if it starts with @ (or %40 which is decoded to @)
    // If users navigate to /@john, params.username is "%40john" -> decoded "@john"
    if (decoded.startsWith('@')) {
        decoded = decoded.substring(1);
    } else {
        // If the route was somehow accessed without @ (e.g. /john directly if we didn't use special char),
        // but our logic assumes this page handles the @ routes primarily.
        // If we strictly only want to support /@..., this check is fine.
    }

    const mapper = initMapper();

    // Find user by username
    const user = await mapper.use('users').where('username', decoded).getOne();

    if (!user) {
        // Fallback: Try to find by name if username lookup failed (legacy support for old "Anonymous User" etc)
        // This is optional but might help with old data
    }

    if (!user) {
        return (
            <div className="layout-container" style={{ padding: '80px 0', textAlign: 'center' }}>
                <h1>User not found</h1>
                <p>The user @{decoded} does not exist.</p>
                <Link href="/" style={{ color: 'var(--color-primary)' }}>Return Home</Link>
            </div>
        );
    }

    // Fetch user's properties
    const properties = await mapper.use('properties').where('listed_by', user.id).get();

    // Enriched properties for the view (similar to API logic)
    const enrichedProperties = properties.map((p: any) => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        property_types: typeof p.property_types === 'string' ? JSON.parse(p.property_types) : p.property_types,
        purposes: typeof p.purposes === 'string' ? JSON.parse(p.purposes) : p.purposes,
        author_username: user.username,
        author_name: user.name,
        author_avatar: (user.name || 'U')[0]
    }));

    return (
        <main style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <header className="full-width-header" style={{ background: '#ffffff', marginBottom: '0' }}>
                <div className="layout-container header-content">
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                        Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                    </Link>
                </div>
            </header>

            {/* Profile Cover & Header */}
            <div style={{ background: 'white', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <div className="layout-container">
                    <div style={{ height: '200px', background: 'linear-gradient(to right, #1e293b, #0f172a)', borderRadius: '0 0 12px 12px' }}></div>
                    <div style={{ padding: '0 20px', marginTop: '-60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
                            <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '4px solid white', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 'bold' }}>
                                {(user.name || 'U')[0]}
                            </div>
                            <div style={{ paddingBottom: '10px' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>{user.name}</h1>
                                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>@{user.username || 'unknown'} • Real Estate Agent</p>
                            </div>
                        </div>
                        <div style={{ paddingBottom: '20px', display: 'flex', gap: '12px' }}>
                            <button style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                                Follow
                            </button>
                            <button style={{ padding: '10px 20px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                                Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="layout-container" style={{ marginTop: '24px', display: 'flex', gap: '24px', flexDirection: 'column' }}>
                {/* Profile Stats / Intro (Optional sidebar for profile) */}

                {/* User's Feed */}
                <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--color-text-muted)' }}>Posted Listings</h3>

                    {enrichedProperties.length === 0 ? (
                        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <p>This user hasn't posted any listings yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Reusing the valid feed structure, mapping to a simplified or same component if available. 
                                Since HomeClient components aren't exported, we'll implement a clean feed view here or import if refactored.
                                For now, I will inline a simplified version of the post card matching the design.
                            */}
                            {enrichedProperties.map((p: any) => (
                                <div key={p.id} className="card" style={{ padding: '0', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden', background: 'white' }}>
                                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                            {p.author_avatar}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{p.author_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.location} • {p.timestamp}</div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '0 16px 12px', fontSize: '0.975rem', lineHeight: '1.4' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--color-gold)', marginRight: '6px' }}>{p.price}</span>
                                        <span>{p.title}. {p.specs}</span>
                                    </div>

                                    <div style={{ height: '400px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {p.images && p.images.length > 0 ? (
                                            <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span>No Image</span>
                                        )}
                                    </div>

                                    <div style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                                            <button style={{ flex: 1, padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', fontWeight: '600' }}>👍 Like {p.likes}</button>
                                            <button style={{ flex: 1, padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', fontWeight: '600' }}>💬 Comment</button>
                                            <button style={{ flex: 1, padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', fontWeight: '600' }}>↗️ Share</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
