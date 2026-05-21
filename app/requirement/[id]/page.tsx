import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatNPR } from '@/lib/formatters';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

function formatBudget(minPrice: number | null, maxPrice: number | null) {
    if (minPrice && maxPrice) {
        return `${formatNPR(minPrice)} - ${formatNPR(maxPrice)}`;
    }
    if (maxPrice) return `Up to ${formatNPR(maxPrice)}`;
    if (minPrice) return `From ${formatNPR(minPrice)}`;
    return 'Budget negotiable';
}

function splitValues(input: string | null | undefined) {
    if (!input) return [];
    return input
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function buildHomeHref(options: {
    tab?: 'property' | 'requirements';
    types?: string[];
    purpose?: string;
    facing?: string;
    location?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
}) {
    const params = new URLSearchParams();
    const tab = options.tab || 'requirements';

    if (tab === 'property') {
        params.set('tab', 'property');
    }

    if (tab === 'requirements') {
        params.append('type', 'requirements');
        (options.types || []).forEach((type) => params.append('type', type));
    }

    if (options.purpose) params.set('purpose', options.purpose);
    if (options.facing) params.set('facing', options.facing);
    if (options.location) params.set('location', options.location);
    if (typeof options.minPrice === 'number') params.set('minPrice', String(options.minPrice));
    if (typeof options.maxPrice === 'number') params.set('maxPrice', String(options.maxPrice));

    const query = params.toString();
    return query ? `/?${query}` : '/';
}

export default async function RequirementPage({ params }: PageProps) {
    const resolvedParams = await params;
    const rawId = resolvedParams.id;
    const id = parseInt(rawId.split('-').pop() || rawId, 10);
    if (isNaN(id)) return notFound();

    const requirement = await prisma.requirement.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    contact_number: true,
                    _count: { select: { requirements: true } }
                }
            }
        }
    });

    if (!requirement) return notFound();

    const locationLabel = [requirement.area, requirement.cityVillage, requirement.district].filter(Boolean).join(', ') || 'Any Location';
    const title = requirement.mode === 'simple'
        ? 'General Property Requirement'
        : `${(requirement.propertyTypes || 'Property').split(',')[0]} requirement`;
    const summary = requirement.mode === 'simple' ? requirement.content : requirement.remarks || 'Detailed requirement submitted.';

    const contactNumber = requirement.user?.contact_number || '';
    const waNumber = String(contactNumber).replace(/[^\d+]/g, '').replace(/^\+/, '');
    const phoneNumber = String(contactNumber).replace(/[^\d+]/g, '');
    const phoneHref = phoneNumber ? `tel:${phoneNumber}` : null;
    const whatsappHref = waNumber ? `https://wa.me/${waNumber}` : null;

    const propertyTypes = splitValues(requirement.propertyTypes);
    const purposes = splitValues(requirement.purposes);
    const facings = splitValues(requirement.facings);
    const locationParts = [requirement.area, requirement.cityVillage, requirement.district].filter(Boolean) as string[];
    const primaryLocation = locationParts[0] || null;
    const suggestionLinks: Array<{ label: string; href: string; tone?: 'primary' | 'muted' }> = [];

    propertyTypes.forEach((type) => {
        suggestionLinks.push({
            label: `See ${type} requirements`,
            href: buildHomeHref({ tab: 'requirements', types: [type] }),
            tone: 'primary',
        });
    });

    purposes.forEach((purpose) => {
        const normalizedPurpose = purpose.toLowerCase();
        suggestionLinks.push({
            label: normalizedPurpose === 'rent' ? 'See rental properties' : normalizedPurpose === 'sale' ? 'See properties on sale' : `See ${purpose} properties`,
            href: buildHomeHref({ tab: 'property', purpose: normalizedPurpose }),
            tone: 'muted',
        });
    });

    facings.forEach((facing) => {
        suggestionLinks.push({
            label: `See ${facing} facing requirements`,
            href: buildHomeHref({ tab: 'requirements', facing }),
            tone: 'primary',
        });
    });

    if (primaryLocation) {
        suggestionLinks.push({
            label: `See requirements in ${primaryLocation}`,
            href: buildHomeHref({ tab: 'requirements', location: primaryLocation }),
            tone: 'primary',
        });
    }

    if (requirement.minPrice || requirement.maxPrice) {
        if (requirement.minPrice) {
            suggestionLinks.push({
                label: `Requirements above ${formatNPR(requirement.minPrice)}`,
                href: buildHomeHref({ tab: 'requirements', minPrice: requirement.minPrice }),
                tone: 'muted',
            });
        }

        if (requirement.maxPrice) {
            suggestionLinks.push({
                label: `Requirements below ${formatNPR(requirement.maxPrice)}`,
                href: buildHomeHref({ tab: 'requirements', maxPrice: requirement.maxPrice }),
                tone: 'muted',
            });
        }
    }

    return (
        <main style={{ padding: '36px 16px 48px' }}>
            <div style={{ maxWidth: '880px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{title}, {locationLabel}</h1>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: '999px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.8rem' }}>{requirement.purposes || 'Any purpose'}</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Posted on {new Date(requirement.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {phoneHref && <a href={phoneHref} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', textDecoration: 'none' }}>Call</a>}
                            {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" style={{ padding: '8px 12px', background: '#25D366', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>WhatsApp</a>}
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ marginBottom: '12px', fontSize: '1rem', color: '#334155' }}>{summary || 'No additional remarks shared.'}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Budget</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatBudget(requirement.minPrice, requirement.maxPrice)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Location</div>
                            <div style={{ fontSize: '0.95rem', color: '#475569' }}>{locationLabel}</div>
                        </div>
                    </div>

                    {requirement.mode !== 'simple' && (
                        <div style={{ marginTop: '14px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Details</div>
                            <div style={{ color: '#475569' }}>
                                <div><strong>Type:</strong> {requirement.propertyTypes || 'Any'}</div>
                                <div><strong>Purpose:</strong> {requirement.purposes || 'Any'}</div>
                                <div><strong>Nature:</strong> {requirement.natures || 'Any'}</div>
                                <div><strong>Facing:</strong> {requirement.facings || 'Any'}</div>
                            </div>
                        </div>
                    )}
                </div>

                {suggestionLinks.length > 0 && (
                    <div style={{ marginTop: '18px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>Suggestions</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>Based on what you&apos;re seeing</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {suggestionLinks.map((suggestion) => (
                                <Link
                                    key={`${suggestion.label}-${suggestion.href}`}
                                    href={suggestion.href}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '10px 14px',
                                        borderRadius: '999px',
                                        border: '1px solid #e2e8f0',
                                        background: suggestion.tone === 'primary' ? 'rgba(14, 165, 233, 0.08)' : '#f8fafc',
                                        color: suggestion.tone === 'primary' ? 'var(--color-primary)' : '#475569',
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {suggestion.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    {requirement.user?.username && (
                        <Link href={`/@${requirement.user.username}/requirements`} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>View all user requirements</Link>
                    )}
                    <Link href="/requirements" style={{ color: '#64748b' }}>Browse other requirements</Link>
                </div>
            </div>
        </main>
    );
}
