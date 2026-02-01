import React from 'react';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { ClassicCollectionView } from './views/ClassicCollectionView';
import { SocialCollectionView } from './views/SocialCollectionView';

export default async function CollectionPublicPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ view?: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const searchParams = await props.searchParams;
    const viewMode = searchParams.view || 'classic'; // 'classic' or 'social'

    const session = await getSession();
    const currentUserId = session ? parseInt(session.id) : null;

    const collection = await prisma.collection.findFirst({
        where: { slug: slug },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profile_picture: true
                }
            },
            properties: {
                include: {
                    property: {
                        include: {
                            location: true,
                            pricing: true,
                            images: { take: 5, orderBy: { id: 'asc' } }, // Take more images for social view
                            types: true
                        }
                    }
                },
                orderBy: { added_at: 'desc' }
            }
        }
    });

    if (!collection) return notFound();

    // Access Control: If private, only owner can view
    if (!collection.is_public) {
        if (currentUserId !== collection.user_id) {
            return notFound(); // Or redirect to login if not logged in
        }
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header Section */}
            <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '60px 0' }}>
                <div className="layout-container">
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 16px',
                            background: '#eff6ff',
                            color: '#3b82f6',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Curated Collection
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', marginBottom: '16px', lineHeight: '1.2' }}>
                            {collection.name}
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>
                            {collection.description || `A collection of ${collection.properties.length} hand-picked properties.`}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden' }}>
                                {collection.user.profile_picture ? (
                                    <img src={collection.user.profile_picture} alt={collection.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#94a3b8' }}>
                                        {collection.user.name[0]}
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Curated By</div>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{collection.user.name}</div>
                            </div>
                        </div>

                        {/* View Toggles */}
                        <div style={{ display: 'flex', justifyContent: 'center', width: 'fit-content', margin: '0 auto', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                            <Link
                                href={`/collection/${collection.slug}?view=classic`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    background: viewMode === 'classic' ? 'white' : 'transparent',
                                    color: viewMode === 'classic' ? '#3b82f6' : '#64748b',
                                    boxShadow: viewMode === 'classic' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span>⊞</span> Classic
                            </Link>
                            <Link
                                href={`/collection/${collection.slug}?view=social`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    background: viewMode === 'social' ? 'white' : 'transparent',
                                    color: viewMode === 'social' ? '#3b82f6' : '#64748b',
                                    boxShadow: viewMode === 'social' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span>☰</span> Feed
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Section */}
            <div className="layout-container" style={{ marginTop: '40px' }}>
                {viewMode === 'social' ? (
                    <SocialCollectionView properties={collection.properties} user={collection.user} />
                ) : (
                    <ClassicCollectionView properties={collection.properties} />
                )}
            </div>
        </div>
    );
}
