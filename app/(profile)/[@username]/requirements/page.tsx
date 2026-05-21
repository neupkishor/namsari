import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{
        '@username': string;
    }>;
}

function formatBudget(minPrice: number | null, maxPrice: number | null) {
    if (minPrice && maxPrice) {
        return `NRs. ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
    }
    if (maxPrice) return `Up to NRs. ${maxPrice.toLocaleString()}`;
    if (minPrice) return `From NRs. ${minPrice.toLocaleString()}`;
    return 'Budget negotiable';
}

export default async function ProfileRequirementsPage({ params }: PageProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const user = await prisma.user.findUnique({
        where: { username: decoded },
    });

    if (!user) return notFound();

    const requirements = await prisma.requirement.findMany({
        where: { userId: user.id, status: 'active' },
        orderBy: { created_at: 'desc' },
    });

    if (requirements.length === 0) {
        return (
            <div className="card" style={{ padding: '60px 40px', textAlign: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>No requirements yet</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '340px', margin: '0 auto' }}>
                    This user hasn&apos;t posted any requirements yet.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requirements.map((req) => {
                const locationLabel = [req.area, req.cityVillage, req.district].filter(Boolean).join(', ') || 'Location not specified';
                const title = req.mode === 'simple'
                    ? `General Property Requirement, ${locationLabel}`
                    : `${(req.propertyTypes || 'Property').split(',')[0]} requirement, ${locationLabel}`;
                const summary = req.mode === 'simple'
                    ? req.content
                    : req.remarks || 'Detailed requirement submitted.';

                return (
                    <div key={req.id} className="card" style={{ padding: '18px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{title}</h3>
                            <span style={{ borderRadius: '999px', background: '#f1f5f9', padding: '6px 12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', whiteSpace: 'nowrap' }}>
                                {req.purposes || 'Any purpose'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px', marginBottom: '0' }}>
                            {summary || 'No additional remarks shared.'}
                        </p>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
                            {formatBudget(req.minPrice, req.maxPrice)}
                        </div>
                        <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '10px', paddingTop: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
                            Posted on {new Date(req.created_at).toLocaleDateString()}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
