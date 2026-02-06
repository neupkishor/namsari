import React from 'react';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { ClassicCollectionView } from './views/ClassicCollectionView';
import { SocialCollectionView } from './views/SocialCollectionView';
import { SiteHeader } from '@/components/SiteHeader';

export default async function CollectionPublicPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ view?: string }> }) {
    const params = await props.params;
    const { slug } = params;

    const session = await getSession();
    const currentUserId = session ? parseInt(session.id) : null;
    const currentUser = currentUserId ? await prisma.user.findUnique({ where: { id: currentUserId } }) : null;

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
                            types: true,
                            features: true
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
            <SiteHeader user={currentUser} />
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
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-primary-light)', marginBottom: '16px', lineHeight: '1.2' }}>
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
                                <div style={{ fontWeight: '600', color: 'var(--color-primary-light)' }}>{collection.user.name}</div>
                            </div>
                        </div>

                        {/* View Toggles Removed as per requirement */}
                    </div>
                </div>
            </header>

            {/* Content Section */}
            <div className="layout-container" style={{ marginTop: '0px' }}>
                {(collection as any).view_mode === 'social' ? (
                    <SocialCollectionView properties={collection.properties} user={collection.user} />
                ) : (
                    <ClassicCollectionView properties={collection.properties} />
                )}
            </div>
        </div>
    );
}
