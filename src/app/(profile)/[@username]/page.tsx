import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PropertyCard } from '@/components/cards/PropertyCard';
import Link from 'next/link';

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

    const user = await (prisma as any).account.findUnique({
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
    const properties = await (prisma as any).property.findMany({
        where: { listedById: user.id },
        orderBy: { created_on: 'desc' },
        take: 3,
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

    // Enriched properties logic
    const enrichedProperties = properties.map((p: any) => {
        const priceValue = p.pricing?.price || 0;
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
            price: formattedPrice,
            location: locationStr,
            images: p.images.map((img: any) => img.url),
            specs: specs,
            author_username: user.username,
            author_name: user.name,
            author_avatar: (user as any).profile_picture || (user.name || 'U')[0]
        };
    });
    
    // Fetch latest 3 reviews
    const reviews = await (prisma as any).review.findMany({
        where: { receiver_id: user.id },
        orderBy: { created_at: 'desc' },
        take: 3,
        include: { author: true }
    });

    // Fetch agents if agency (latest 4)
    let agents: any[] = [];
    if (user.type === 'agency') {
        agents = await (prisma as any).account.findMany({
            where: { agency_id: user.id },
            take: 4,
            include: {
                _count: { select: { listedProperties: true } }
            }
        });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* About Section */}
            {user.bio && (
                <div className="card" style={{ padding: '24px', background: 'white' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>About</h3>
                    <p style={{ lineHeight: '1.6', color: '#334155' }}>{user.bio}</p>
                </div>
            )}

            {/* Properties Section */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Latest Listings</h3>
                    {user._count.listedProperties > 3 && (
                        <Link href={`/@${user.username}/properties`} style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
                            View all ({user._count.listedProperties}) →
                        </Link>
                    )}
                </div>
                
                {enrichedProperties.length > 0 ? (
                    <div className="profile-property-grid">
                        {enrichedProperties.map((p: any) => (
                            <PropertyCard key={p.id} property={p} />
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        No listings yet.
                    </div>
                )}
            </div>

            {/* Agents Section (Agency Only) */}
            {user.type === 'agency' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Our Agents</h3>
                        {user._count.agents > 4 && (
                            <Link href={`/@${user.username}/agents`} style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
                                View all ({user._count.agents}) →
                            </Link>
                        )}
                    </div>

                    {agents.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            {agents.map((agent: any) => (
                                <Link href={`/@${agent.username}`} key={agent.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card" style={{ padding: '16px', textAlign: 'center', transition: 'transform 0.2s' }}>
                                        <div 
                                            style={{ 
                                                width: '64px', 
                                                height: '64px', 
                                                borderRadius: '50%', 
                                                overflow: 'hidden', 
                                                margin: '0 auto 12px',
                                                backgroundColor: '#e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem'
                                            }}
                                        >
                                            {agent.profile_picture ? (
                                                <img src={agent.profile_picture} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span>{(agent.name || 'U')[0]}</span>
                                            )}
                                        </div>
                                        <div style={{ fontWeight: '600' }}>{agent.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{agent._count.listedProperties} listings</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                            No agents listed.
                        </div>
                    )}
                </div>
            )}

            {/* Reviews Section */}
            <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Reviews</h3>
                    {user._count.reviews_received > 3 && (
                        <Link href={`/@${user.username}/reviews`} style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
                            View all ({user._count.reviews_received}) →
                        </Link>
                    )}
                </div>
                
                {reviews.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {reviews.map((review: any) => (
                             <div key={review.id} className="card" style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div 
                                        style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '50%', 
                                            overflow: 'hidden', 
                                            backgroundColor: '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {review.author.profile_picture ? (
                                            <img src={review.author.profile_picture} alt={review.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span>{(review.author.name || 'U')[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{review.author.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#334155' }}>{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        No reviews yet.
                    </div>
                )}
            </div>
        </div>
    );
}
