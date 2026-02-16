import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { PropertyCard } from '@/components/cards/PropertyCard';

interface PageProps {
    params: Promise<{
        '@username': string;
    }>;
}

export default async function ProfileSavedPage({ params }: PageProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const user = await prisma.account.findUnique({
        where: { username: decoded }
    });

    if (!user) return notFound();

    const session = await getSession();
    // Allow access only if logged in user is the owner of this profile
    const isOwner = session?.id === user.id.toString();

    if (!isOwner) {
        // If not owner, show "Private" or redirect.
        // The user specifically asked "the /@[username]/saved should only be visible and active to the user self."
        // Redirection to main profile might be cleaner, but a "Private" message is clearer why access was denied.
        return (
            <div className="card" style={{ padding: '60px 40px', textAlign: 'center', background: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Private Collection</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                    This user's saved items are private. You can only view your own saved properties.
                </p>
            </div>
        );
    }

    // Fetch liked properties
    const likes = await prisma.like.findMany({
        where: { user_id: user.id },
        include: {
            property: {
                include: {
                    listedBy: true, // Need this for author info
                    images: true,
                    types: true,
                    location: true,
                    pricing: true,
                    features: true,
                    property_likes: true // Count likes
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });

    const enrichedProperties = likes.map((like) => {
        const p = like.property;
        const authorUser = p.listedBy;

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
            slug: p.slug || undefined,
            price: formattedPrice,
            location: locationStr,
            images: p.images.map((img) => img.url),
            specs: specs,
            likes_count: p.property_likes?.length || 0,
            // Proper author info from the property lister
            author_username: authorUser ? authorUser.username : null,
            author_name: authorUser ? authorUser.name : 'Unknown',
            author_avatar: authorUser?.profile_picture || (authorUser?.name || 'U')[0],
            timestamp: 'Saved'
        };
    });

    if (enrichedProperties.length === 0) {
        return (
            <div className="card" style={{ padding: '60px 40px', textAlign: 'center', background: 'white' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❤️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>No saved properties</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '300px', margin: '0 auto' }}>
                    Items you save or like will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="profile-property-grid">
            {enrichedProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
            ))}
        </div>
    );
}
