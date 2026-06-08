import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { PaginationControl } from '@/components/ui';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';
import { legacyPricingFromPrice } from '@/lib/pricing';

export default async function ManagePropertiesPage({ searchParams }: { searchParams: Promise<{ page?: string; view?: string }> }) {
    const user = await getCurrentUser();
    
    if (!user) {
        redirect('/auth/login');
    }

    const { page: pageParam, view: viewParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const isAdmin = user.type === 'admin';
    const isAgency = user.type === 'agency';
    const isAgent = user.type === 'agent';

    let whereClause: any = {};

    // Logic for Filtering based on User Role and View Param
    if (isAdmin) {
        if (viewParam === 'mine') {
            whereClause = { listedById: user.id };
        } else {
            // Default: All properties (No filter)
        }
    } else if (isAgency) {
        if (viewParam === 'mine') {
            whereClause = { listedById: user.id };
        } else {
            // Default: Agency Properties (Own + Agents)
            whereClause = {
                OR: [
                    { listedById: user.id },
                    { listedBy: { agency_id: user.id } }
                ]
            };
        }
    } else {
        // Agent or Regular User: Only their own properties
        whereClause = { listedById: user.id };
    }

    const [properties, totalCount] = await Promise.all([
        prisma.property.findMany({
            where: whereClause,
            include: {
                listedBy: true,
                location: true,
                images: true,
                types: true
            },
            orderBy: { created_on: 'desc' },
            skip,
            take: limit
        }),
        prisma.property.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const enrichedProperties = properties.map((p: any) => {
        const property = {
            ...p,
            pricing: legacyPricingFromPrice(p.price as any),
        };
        const priceValue = property.pricing?.price || 0;
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

        return {
            ...property,
            price: formattedPrice,
            location: locationStr,
            author_name: p.listedBy?.name || 'Unknown',
            author_username: p.listedBy?.username || '',
            author_avatar: p.listedBy?.profile_picture || (p.listedBy?.name || 'U')[0],
            main_category: mainCategory,
            images: p.images.map((img: any) => img.url),
        };
    });

    // Helper for Pill Styles
    const getPillStyle = (active: boolean) => ({
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'none',
        background: active ? 'var(--color-primary)' : '#f1f5f9',
        color: active ? 'white' : '#64748b',
        border: active ? '1px solid var(--color-primary)' : '1px solid #e2e8f0',
        transition: 'all 0.2s'
    });

    return (
        <div>
            <header style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Property Management</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Overview of all listed assets.</p>
                    </div>
                    <Link href="/sell" style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }}>
                        + Add New Asset
                    </Link>
                </div>

                {/* View Filters (Pills) */}
                {(isAdmin || isAgency) && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link href="/manage/properties" style={getPillStyle(!viewParam || viewParam === 'default')}>
                            {isAdmin ? 'All Properties' : 'Agency Properties'}
                        </Link>
                        <Link href="/manage/properties?view=mine" style={getPillStyle(viewParam === 'mine')}>
                            My Properties
                        </Link>
                    </div>
                )}
            </header>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                {enrichedProperties.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No properties found.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '940px' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Property</th>
                                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Owner</th>
                                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                                    <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Price</th>
                                    <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Listed</th>
                                    <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrichedProperties.map((p: any) => {
                                    const propertyPath = `${p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.id}`;
                                    const statusColor = p.status === 'approved' ? '#166534' : p.status === 'rejected' ? '#991b1b' : '#92400e';
                                    const statusBg = p.status === 'approved' ? '#dcfce7' : p.status === 'rejected' ? '#fee2e2' : '#fef3c7';

                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{ width: '72px', height: '54px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                                                        {p.images?.[0] ? (
                                                            <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.title} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>No image</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link href={`/manage/properties/${propertyPath}`} style={{ color: 'var(--color-primary-light)', fontWeight: 800, textDecoration: 'none', display: 'block', marginBottom: '4px' }}>
                                                            {p.title}
                                                        </Link>
                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', color: '#64748b', fontSize: '0.82rem' }}>
                                                            <span>#{p.propertyId || p.id}</span>
                                                            <span>{p.main_category}</span>
                                                            <span>{p.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 700 }}>{p.author_name}</td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                                    <span style={{ background: statusBg, color: statusColor, padding: '4px 9px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'capitalize' }}>{p.status}</span>
                                                    <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'capitalize' }}>{p.soldStatus || 'unsold'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--color-primary-light)', fontWeight: 800 }}>{p.price}</td>
                                            <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '0.88rem' }}>{new Date(p.created_on).toLocaleDateString()}</td>
                                            <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: '12px' }}>
                                                    <Link href={`/properties/${propertyPath}`} style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                                                        View
                                                    </Link>
                                                    <Link href={`/manage/properties/${propertyPath}`} style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none' }}>
                                                        Manage
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
