import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PropertyCard } from '@/components/cards/PropertyCard';
import Link from 'next/link';
import { AutoScrollCarousel } from '@/components/ui/AutoScrollCarousel';
import { legacyPricingFromPrice } from '@/lib/pricing';

interface PageProps {
    params: Promise<{
        '@username': string;
    }>;
}

export default async function ProfileOverviewPage({ params }: PageProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const user = await prisma.user.findUnique({
        where: { username: decoded },
        include: {
            _count: {
                select: {
                    listedProperties: true,
                    reviews_received: true,
                    agents: true
                }
            }
        }
    });

    if (!user) return notFound();

    // Fetch latest 3 properties
    const properties = await prisma.property.findMany({
        where: { listedById: user.id },
        orderBy: { created_on: 'desc' },
        take: 3,
        include: {
            listedBy: true,
            location: true,
            features: true,
            property_likes: true,
            propertyMedia: { orderBy: { index: 'asc' } }
        }
    });

    // Enriched properties logic
    const enrichedProperties = properties.map((p: any) => {
        const priceValue = typeof p.price === 'object' && p.price !== null
            ? Number((p.price as any).price) || 0
            : Number(p.price) || 0;
        const formattedPrice = new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            maximumFractionDigits: 0
        }).format(Number(priceValue)).replace('NPR', 'NRs.');

        const locationStr = p.location
            ? `${p.location.area}, ${p.location.district}`
            : 'Unspecified';

        const specs = p.features
            ? `${p.features.bedrooms || 0}BHK • ${p.features.bathrooms || 0} Bath • ${p.features.builtUpArea || 0} ${p.features.builtUpAreaUnit || ''}`
            : 'Details unspecified';

        return {
            ...p,
            pricing: legacyPricingFromPrice(p.price as any),
            price: formattedPrice,
            location: locationStr,
            images: (p.propertyMedia || [])
                .filter((media: any) => media.type === 'image')
                .map((media: any) => media.resourceUrl),
            specs: specs,
            author_username: user.username,
            author_name: user.name,
            author_avatar: (user as any).profile_picture || (user.name || 'U')[0]
        };
    });
    
    // Fetch latest 3 reviews
    const reviews = await prisma.review.findMany({
        where: { receiver_id: user.id },
        orderBy: { created_at: 'desc' },
        take: 3,
        include: { author: true }
    });

    // Fetch top agents if agency (max 10 by most listings)
    let agents: any[] = [];
    if (user.type === 'agency') {
        agents = await prisma.user.findMany({
            where: { agency_id: user.id },
            take: 10,
            orderBy: {
                listedProperties: {
                    _count: 'desc'
                }
            },
            include: {
                _count: { select: { listedProperties: true } }
            }
        });
    }

    // Render logic based on user type
    if (user.type === 'bank') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Bank About Section */}
                <div className="card" style={{ padding: '32px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', color: '#1e293b' }}>About {user.name}</h3>
                    <p style={{ lineHeight: '1.7', color: '#475569', fontSize: '1.05rem' }}>
                        {user.bio || `${user.name} provides competitive home loan rates and mortgage solutions tailored to your needs. Contact us to find out more about our financing options.`}
                    </p>
                </div>

                {/* Bank Products / Rates (Mock for now) */}
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px', color: '#1e293b' }}>Mortgage Products</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {/* Standard Home Loan */}
                        <div className="card" style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'white' }}>
                            <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px', color: '#059669' }}>🏠</div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Home Loan</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>Competitive interest rates for buying your dream home.</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Base Rate</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#059669' }}>9.5%</div>
                                </div>
                                <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Details</button>
                            </div>
                        </div>
                        {/* Land Loan */}
                        <div className="card" style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'white' }}>
                            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px', color: '#2563eb' }}>cj</div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Land Purchase Loan</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>Financing for purchasing residential land plots.</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Base Rate</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#2563eb' }}>10.5%</div>
                                </div>
                                <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Details</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calculator CTA */}
                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '24px', padding: '40px', color: 'white', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px' }}>Plan your finances</h3>
                    <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 32px' }}>Use our EMI calculator to estimate your monthly payments and find a loan that fits your budget.</p>
                    <button style={{ padding: '14px 32px', background: 'white', color: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}>
                        Open EMI Calculator
                    </button>
                </div>
            </div>
        );
    }

    // Default View (Agent & Agency)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Team Members First (Agencies only) */}
            {user.type === 'agency' && agents.length > 0 && (
                <section>
                    <AutoScrollCarousel itemWidth="260px" gap="16px" desktopItemCount={4} tabletItemCount={2} mobileItemCount={1}>
                        {agents.map((agent: any) => (
                            <Link key={agent.id} href={`/@${agent.username}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                <div
                                    className="card"
                                    style={{
                                        padding: '24px',
                                        textAlign: 'center',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '24px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        minHeight: '190px'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            margin: '0 auto 16px',
                                            backgroundColor: '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2.5rem'
                                        }}
                                    >
                                            {agent.profile_picture ? (
                                                <img src={agent.profile_picture} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span>{(agent.name || 'U')[0]}</span>
                                            )}
                                    </div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '4px' }}>{agent.name}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '12px' }}>@{agent.username}</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.875rem', color: '#64748b' }}>
                                        <span>🏠 {agent._count.listedProperties} Properties</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </AutoScrollCarousel>
                </section>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Properties Feed */}
                <div>
                    {enrichedProperties.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {enrichedProperties.map((p: any) => (
                                <PropertyCard key={p.id} property={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🏠</div>
                            <p style={{ fontWeight: '500' }}>No active listings to show.</p>
                        </div>
                    )}
                </div>

                {/* Reviews Feed Style */}
                {reviews.length > 0 && (
                    <div>
                        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '20px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>Recent Activity & Reviews</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {reviews.map((review: any) => (
                                <div key={review.id} className="card" style={{ padding: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden' }}>
                                            {review.author.profile_picture ? (
                                                <img src={review.author.profile_picture} alt={review.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#94a3b8' }}>{(review.author.name || 'U')[0]}</div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{review.author.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>reviewed {user.name}</div>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', marginBottom: '12px' }}>{review.comment}</p>
                                    <div style={{ fontSize: '0.9rem', color: '#fbbf24', letterSpacing: '2px' }}>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
