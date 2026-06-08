import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { legacyPricingFromPrice } from '@/lib/pricing';

interface PageProps {
    params: Promise<{
        '@username': string;
    }>;
}

export default async function ProfilePropertiesPage({ params }: PageProps) {
    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    let decoded = decodeURIComponent(username);
    // Remove the '@' prefix if present
    if (!decoded.startsWith('@')) {
        return notFound();
    }
    // Remove the '@' prefix
    decoded = decoded.substring(1);

    const user = await prisma.user.findUnique({
        where: { username: decoded }
    });

    if (!user) return notFound();

    // Fetch user's properties with relations
    const properties = await prisma.property.findMany({
        where: { listedById: user.id },
        orderBy: { created_on: 'desc' },
        include: {
            listedBy: true,
            location: true,
            images: true,
            types: true,
            features: true,
            property_likes: true
        }
    });

    // Enriched properties for the view
    const enrichedProperties = properties.map((p) => {
        const pricing = legacyPricingFromPrice(p.price as any);
        const priceValue = pricing?.price || 0;
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
            pricing,
            slug: p.slug || undefined,
            price: formattedPrice,
            location: locationStr,
            images: p.images.map((img) => img.url),
            specs: specs,
            author_username: user.username,
            author_name: user.name,
            author_avatar: user.profile_picture || (user.name || 'U')[0]
        };
    });

    if (enrichedProperties.length === 0) {
        return (
            <div className="card" style={{ padding: '60px 40px', textAlign: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏘️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>No active listings</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '300px', margin: '0 auto' }}>This user hasn't posted any properties for sale or rent yet.</p>
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
