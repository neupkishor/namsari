import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PropertyManageClient from '@/app/(sbar)/manage/properties/[slugAndId]/PropertyManageClient';
import { getSession } from '@/lib/auth';
import { getAgencyConfigByAgencyId } from '@/actions/agency-config';
import { resolveActiveAgencyId } from '@/lib/agency-config';
import { legacyPricingFromPrice } from '@/lib/pricing';

export default async function ManagePropertyDetailPage({ params }: { params: Promise<{ slugAndId: string }> }) {
    const resolvedParams = await params;
    const { slugAndId } = resolvedParams;

    // Extract numeric ID from slug-id format (robust against malformed slug text)
    const idMatch = slugAndId.match(/(\d+)(?!.*\d)/);
    const id = idMatch ? parseInt(idMatch[1], 10) : NaN;

    if (isNaN(id)) return notFound();

    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            listedBy: true,
            location: true,
            propertyMedia: {
                orderBy: { index: 'asc' }
            },
            propertyPrices: {
                orderBy: { isDefault: 'desc' }
            },
            features: true,
            propertyAmmenities: true,
            property_likes: true,
            comments: true,
        }
    });

    if (!property) return notFound();

    const propertyWithLegacyPricing = {
        ...property,
        pricing: legacyPricingFromPrice((property.propertyPrices?.[0]?.base || null) as any),
        images: property.propertyMedia
            .filter((media) => media.type === 'image')
            .map((media) => ({ id: media.id, url: media.resourceUrl })),
    } as any;

    const session = await getSession();
    const currentUser = session?.id
        ? await prisma.user.findUnique({
            where: { id: Number(session.id) },
            include: { role: true },
        })
        : null;

    const activeAgencyId = currentUser ? resolveActiveAgencyId(currentUser, session?.operatingId) : null;
    const agencyConfig = activeAgencyId ? await getAgencyConfigByAgencyId(activeAgencyId) : null;
    const isAdmin = Boolean(currentUser && (currentUser.type === 'admin' || currentUser.role?.role?.toLowerCase().includes('admin')));
    const isAgencyOwner = Boolean(currentUser && currentUser.type === 'agency' && (property?.listedBy as any)?.agency_id === currentUser.id);
    const isOwnProperty = Boolean(currentUser && property.listedById === currentUser.id);
    const isAgent = Boolean(currentUser && currentUser.type === 'agent');
    const canDelete = Boolean(currentUser && (isAdmin || isAgencyOwner || isOwnProperty || (isAgent && agencyConfig?.canAgentDelete !== false)));
    const priceValue = propertyWithLegacyPricing.pricing?.price || 0;
    const formattedPrice = priceValue
        ? new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(Number(priceValue)).replace('NPR', 'NRs.')
        : 'Price on request';
    const locationLabel = property.location
        ? [property.location.area, property.location.cityVillage, property.location.district].filter(Boolean).join(', ')
        : 'Location unspecified';
    const typeLabel = property.types?.map((type) => type.name).join(', ') || 'Property';

    return (
        <div style={{ paddingBottom: '100px', display: 'grid', gap: '24px' }}>
            <header style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', display: 'grid', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                        <Link href="/manage/properties" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700', display: 'inline-block', marginBottom: '12px' }}>
                            ← Back to Properties
                        </Link>
                        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 850, color: 'var(--color-primary-light)', marginBottom: '10px', lineHeight: 1.15 }}>
                            {property.title}
                        </h1>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', color: '#64748b', fontSize: '0.92rem', fontWeight: 650 }}>
                            <span>#{property.propertyId || property.id}</span>
                            <span>{typeLabel}</span>
                            <span>{locationLabel}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Link
                            href={`/properties/${slugAndId}`}
                            target="_blank"
                            style={{ background: '#f8fafc', color: '#475569', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', border: '1px solid #e2e8f0' }}
                        >
                            View Public Page
                        </Link>
                        <Link
                            href={`/sell?id=${property.id}`}
                            style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: '800' }}
                        >
                            Edit Listing
                        </Link>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    <SummaryMetric label="Price" value={formattedPrice} />
                    <SummaryMetric label="Listing status" value={property.status} tone={property.status === 'approved' ? 'green' : property.status === 'rejected' ? 'red' : 'amber'} />
                    <SummaryMetric label="Market status" value={property.soldStatus || 'unsold'} />
                    <SummaryMetric label="Listed by" value={property.listedBy?.name || 'Unknown'} />
                </div>
            </header>

            <PropertyManageClient property={propertyWithLegacyPricing} canDelete={canDelete} />
        </div>
    );
}

function SummaryMetric({ label, value, tone }: { label: string; value: string; tone?: 'green' | 'red' | 'amber' }) {
    const toneStyles = tone === 'green'
        ? { color: '#166534', background: '#dcfce7' }
        : tone === 'red'
            ? { color: '#991b1b', background: '#fee2e2' }
            : tone === 'amber'
                ? { color: '#92400e', background: '#fef3c7' }
                : { color: 'var(--color-primary-light)', background: '#f8fafc' };

    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#fff' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{label}</div>
            <div style={{ display: 'inline-flex', maxWidth: '100%', ...toneStyles, padding: tone ? '4px 9px' : 0, borderRadius: tone ? '999px' : 0, fontWeight: 850, fontSize: '0.98rem', textTransform: tone ? 'capitalize' : 'none' }}>
                {value}
            </div>
        </div>
    );
}
