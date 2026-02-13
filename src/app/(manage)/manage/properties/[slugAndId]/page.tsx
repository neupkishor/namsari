import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PropertyManageClient from './PropertyManageClient';

export default async function ManagePropertyDetailPage({ params }: { params: Promise<{ slugAndId: string }> }) {
    const resolvedParams = await params;
    const { slugAndId } = resolvedParams;

    // Extract ID from slug-id format
    const parts = slugAndId.split('-');
    const idStr = parts[parts.length - 1];
    const id = parseInt(idStr);

    if (isNaN(id)) return notFound();

    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            listedBy: true,
            pricing: true,
            location: true,
            images: true,
            types: true,
            features: true,
            property_likes: true,
            comments: true,
        }
    });

    if (!property) return notFound();

    return (
        <div style={{ paddingBottom: '100px' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Link href="/manage/properties" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                            ← Back to Registry
                        </Link>
                    </div>
                    <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Manage: {property.title}</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Inventory Ref: #{property.id} • Internal Management Dashboard</p>
                </div>
                <Link
                    href={`/properties/${slugAndId}`}
                    target="_blank"
                    style={{ background: '#f1f5f9', color: '#475569', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', border: '1px solid #e2e8f0' }}
                >
                    View Public Page ↗
                </Link>
            </header>

            <PropertyManageClient property={property} />
        </div>
    );
}
