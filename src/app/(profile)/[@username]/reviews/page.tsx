import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{
        '@username': string;
    }>;
}

import ReviewForm from '@/components/ReviewForm';
import { getSession } from '@/lib/auth';

export default async function ProfileReviewsPage({ params }: PageProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const user = await prisma.user.findUnique({
        where: { username: decoded },
        include: {
            reviews_received: {
                include: {
                    author: true
                },
                orderBy: { created_at: 'desc' }
            }
        }
    });

    if (!user) return notFound();

    const session = await getSession();
    const isSelf = session?.id === user.id.toString();
    const reviews = user.reviews_received;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Reviews ({reviews.length})</h2>

            {session && session.id && !isSelf && (
                <ReviewForm receiverId={user.id} receiverName={user.name || 'User'} />
            )}

            {reviews.length === 0 ? (
                <div className="card" style={{ padding: '60px 40px', textAlign: 'center', background: 'white' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⭐</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>No reviews yet</h3>
                    <p style={{ color: 'var(--color-text-muted)', maxWidth: '300px', margin: '0 auto' }}>
                        This user hasn't received any reviews yet.
                    </p>
                </div>
            ) : (
                reviews.map((review: any) => (
                    <div key={review.id} className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            <Link href={`/@${review.author.username}`} style={{ textDecoration: 'none' }}>
                                <div 
                                    style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        borderRadius: '50%', 
                                        overflow: 'hidden', 
                                        backgroundColor: '#e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem'
                                    }}
                                >
                                    {review.author.profile_picture ? (
                                        <img 
                                            src={review.author.profile_picture} 
                                            alt={review.author.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <span>{(review.author.name || 'U')[0]}</span>
                                    )}
                                </div>
                            </Link>
                            
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <Link href={`/@${review.author.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <h4 style={{ fontWeight: '600', fontSize: '1rem' }}>{review.author.name}</h4>
                                    </Link>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', color: '#fbbf24' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} style={{ fontSize: '1rem' }}>
                                            {i < review.rating ? '★' : '☆'}
                                        </span>
                                    ))}
                                </div>
                                
                                {review.comment && (
                                    <p style={{ color: '#334155', lineHeight: '1.5' }}>
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
