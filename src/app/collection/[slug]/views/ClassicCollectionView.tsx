import { PropertyCard } from '@/components/PropertyCard';

export function ClassicCollectionView({ properties }: { properties: any[] }) {
    if (properties.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No properties in this collection yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {properties.map(({ property }) => {
                // Map the collection property data structure to the PropertyCard's expected structure
                const mappedProperty = {
                    id: property.id,
                    title: property.title,
                    slug: property.slug,
                    price: property.pricing ?
                        new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(property.pricing.price).replace('NPR', 'NRs.') :
                        'Price on Request',
                    location: property.location ? `${property.location.area}, ${property.location.district}` : 'Location Unspecified',
                    specs: property.features ? `${property.features.bedrooms || 0}BHK • ${property.features.bathrooms || 0} Bath` : '',
                    images: property.images?.map((img: any) => img.url) || []
                };

                return <PropertyCard key={property.id} property={mappedProperty} />;
            })}
        </div>
    );
}
