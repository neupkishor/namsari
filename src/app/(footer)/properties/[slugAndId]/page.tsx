import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyMap from './PropertyMap';
import { Header } from '@/components/menu/Header';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { PropertyCard } from '@/components/cards/PropertyCard';

function getAmenityIcon(type: string) {
    const map: Record<string, string> = {
        hospital: '🏥',
        school: '🏫',
        park: '🌳',
        gym: '🏋️',
        pharmacy: '💊',
        restaurant: '🍽️',
        hotel: '🏨',
        atm: '🏧',
        'police station': '🚓',
        'public transport': '🚌',
        'woda office': '🏢',
        banquete: '🎉',
        market: '🛒',
        shopping: '🛍️',
        bank: '🏦',
        airport: '✈️'
    };
    return map[type.toLowerCase()] || '📍';
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slugAndId: string }> }) {
    const resolvedParams = await params;
    const { slugAndId } = resolvedParams;

    const session = await getSession();
    const currentUser = session ? await (prisma as any).account.findUnique({ where: { id: Number(session.id) } }) : null;

    // Extract ID from slug-id format
    const parts = slugAndId.split('-');
    const idStr = parts[parts.length - 1];
    const id = parseInt(idStr);

    if (isNaN(id)) return notFound();

    // Fetch property and settings
    const property = await (prisma as any).property.findUnique({
        where: { id },
        include: {
            listedBy: true,
            pricing: true,
            location: true,
            images: true,
            types: true,
            features: true,
            amenities: true,
            comments: {
                include: { user: true },
                orderBy: { created_at: 'desc' }
            },
            property_likes: true
        }
    });

    if (!property) return notFound();

    // Increment view count asynchronously
    await (prisma as any).property.update({
        where: { id: property.id },
        data: { views: { increment: 1 } }
    });

    const isLiked = session && property.property_likes.some((l: any) => l.user_id === Number(session.id));
    const images = property.images.map((img: any) => img.url);
    const locationStr = property.location
        ? `${property.location.area}, ${property.location.district}`
        : 'Unspecified';
    const priceValue = property.pricing?.price || 0;
    const formattedPrice = new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(priceValue).replace('NPR', 'Rs.');

    // Fetch recommended properties
    const recommendedProperties = await (prisma as any).property.findMany({
        where: {
            id: { not: id },
            types: { some: { id: { in: property.types.map((t: any) => t.id) } } }
        },
        take: 3,
        orderBy: { created_on: 'desc' },
        include: {
            images: true,
            location: true,
            pricing: true,
            features: true
        }
    });

    return (
        <main style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'var(--header-height, 72px)' }}>
            <Header user={currentUser} />

            <style dangerouslySetInnerHTML={{
                __html: `
                .property-page-container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 24px;
                }
                
                /* Gallery Grid */
                .gallery-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 12px;
                    height: 500px;
                    border-radius: 16px;
                    overflow: hidden;
                    margin-bottom: 40px;
                }
                .gallery-main {
                    height: 100%;
                    position: relative;
                }
                .gallery-side {
                    display: grid;
                    grid-template-rows: 1fr 1fr;
                    gap: 12px;
                    height: 100%;
                }
                .gallery-item {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }
                .gallery-item:hover {
                    transform: scale(1.02);
                }
                
                /* Layout Split */
                .content-split {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 64px;
                    align-items: start;
                }
                
                /* Typography */
                .prop-title {
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                    line-height: 1.2;
                }
                .prop-location {
                    font-size: 1.1rem;
                    color: #4b5563;
                    margin-bottom: 24px;
                    font-weight: 500;
                }
                .section-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 20px;
                }
                
                /* Features Divider */
                .feature-row {
                    display: flex;
                    gap: 24px;
                    padding: 24px 0;
                    margin: 32px 0;
                }
                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1rem;
                    color: #374151;
                }

                /* Agent Card */
                .agent-card {
                    position: sticky;
                    top: 100px;
                    border: 1px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
                    background: white;
                }
                .price-display {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin-bottom: 24px;
                }
                .action-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }
                .btn-primary {
                    background-color: var(--color-primary);
                    color: white;
                    border: none;
                    margin-bottom: 12px;
                }
                .btn-primary:hover {
                    background-color: var(--color-primary-light);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(130, 0, 0, 0.2);
                }
                .btn-outline {
                    background-color: white;
                    color: #1a1a1a;
                    border: 1px solid #d1d5db;
                }
                .btn-outline:hover {
                    border-color: #1a1a1a;
                    background-color: #f9fafb;
                }

                /* Amenities Grid */
                .amenities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 16px;
                    margin-bottom: 40px;
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .content-split {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    .gallery-grid {
                        height: 400px;
                    }
                    .agent-card {
                        position: static;
                        margin-top: 40px;
                    }
                }
                @media (max-width: 640px) {
                    .gallery-grid {
                        display: flex;
                        overflow-x: auto;
                        height: 300px;
                        scroll-snap-type: x mandatory;
                        border-radius: 0;
                        margin: -24px -24px 24px -24px;
                        gap: 0;
                    }
                    .gallery-main, .gallery-side {
                        min-width: 100%;
                        scroll-snap-align: center;
                    }
                    .gallery-side {
                        display: none;
                    }
                    .gallery-item {
                        border-radius: 0;
                    }
                    .prop-title {
                        font-size: 1.75rem;
                    }
                    .property-page-container {
                        padding: 24px 16px;
                    }
                }
            `}} />

            <div className="property-page-container">
                {/* Header Info (Mobile Only - usually good to have title first on mobile, but preserving consistent DOM) */}

                {/* Image Gallery */}
                {/* Image Gallery */}
                <div className="gallery-grid" style={{
                    gridTemplateColumns: images.length <= 1 ? '1fr' : images.length === 2 ? '1fr 1fr' : '2fr 1fr'
                }}>
                    <div className="gallery-main">
                        {images.length > 0 ? (
                            <Link href={`/properties/${slugAndId}/gallery`} style={{ display: 'block', height: '100%', width: '100%' }}>
                                <img src={images[0]} className="gallery-item" alt="Main View" />
                            </Link>
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Image</div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="gallery-side" style={{
                            gridTemplateRows: images.length === 2 ? '1fr' : '1fr 1fr'
                        }}>
                            <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
                                <Link href={`/properties/${slugAndId}/gallery`} style={{ display: 'block', height: '100%', width: '100%' }}>
                                    <img src={images[1]} className="gallery-item" alt="View 2" />
                                </Link>
                            </div>
                            {images.length > 2 && (
                                <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
                                    <Link href={`/properties/${slugAndId}/gallery`} style={{ display: 'block', height: '100%', width: '100%', position: 'relative' }}>
                                        <img src={images[2]} className="gallery-item" alt="View 3" />
                                        {images.length > 3 && (
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.25rem' }}>
                                                +{images.length - 3} more
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="content-split">
                    {/* Main Details */}
                    <div>
                        <div style={{ marginBottom: '32px' }}>
                            <h1 className="prop-title">{property.title}</h1>
                            <div className="prop-location">📍 {locationStr}</div>

                            <div className="feature-row">
                                <div className="feature-item">
                                    <span>🛏️</span>
                                    <strong>{property.features?.bedrooms || '-'}</strong>
                                    <span>Bedrooms</span>
                                </div>
                                <div className="feature-item">
                                    <span>🚿</span>
                                    <strong>{property.features?.bathrooms || '-'}</strong>
                                    <span>Bathrooms</span>
                                </div>
                                <div className="feature-item">
                                    <span>📐</span>
                                    <strong>{property.features?.builtUpArea || '-'}</strong>
                                    <span>{property.features?.builtUpAreaUnit || 'sqft'}</span>
                                </div>
                                <div className="feature-item">
                                    <span>🏗️</span>
                                    <strong>{new Date(property.created_on).getFullYear()}</strong>
                                    <span>Year</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f3f4f6', overflow: 'hidden' }}>
                                    {property.listedBy?.profile_picture ? (
                                        <img src={property.listedBy.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={property.listedBy.name} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👤</div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1a1a1a' }}>Hosted by {property.listedBy?.name || 'Agent'}</div>
                                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{(property.listedBy as any)?.type ? (property.listedBy as any).type.charAt(0).toUpperCase() + (property.listedBy as any).type.slice(1) : 'Host'} • Joined {new Date(property.listedBy?.created_on || Date.now()).getFullYear()}</div>
                                </div>
                            </div>
                            <p style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#4b5563' }}>
                                {property.remarks || 'This property offers a perfect blend of luxury and comfort, situated in a prime location with easy access to all essential amenities.'}
                            </p>
                        </div>



                        <div style={{ marginBottom: '40px' }}>
                            <h2 className="section-title">What this place offers</h2>
                            <div className="amenities-grid">
                                {property.features?.parkingAvailable && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>🚗 Parking Available</div>
                                )}
                                {property.roadSize && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>🛣️ {property.roadSize} Road</div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>🧭 {property.facingDirection || 'Any'} Facing</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>🏢 {property.features?.totalFloors} Floors</div>
                                {/* Add more static or dynamic amenities */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>💧 Water Supply</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>⚡ Electricity</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>🗑️ Drainage</div>
                            </div>
                        </div>

                        {property.amenities && property.amenities.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <h2 className="section-title">Nearby Amenities</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                    {property.amenities.map((amenity: any) => (
                                        <div key={amenity.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '1.5rem' }}>{getAmenityIcon(amenity.type)}</span>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#1a1a1a', textTransform: 'capitalize' }}>{amenity.type.replace(/_/g, ' ')}</div>
                                                    {amenity.name && <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{amenity.name}</div>}
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: '700', color: '#4b5563', fontSize: '0.9rem' }}>{amenity.distance || 'N/A'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '40px' }}>
                            <h2 className="section-title">Where you'll be</h2>
                            <div style={{ height: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                <PropertyMap
                                    property={{
                                        id: property.id,
                                        title: property.title,
                                        price: priceValue,
                                        latitude: property.location?.latitude || 27.7172,
                                        longitude: property.location?.longitude || 85.3240,
                                        location: locationStr
                                    }}
                                    images={images}
                                />
                            </div>
                            <div style={{ marginTop: '16px', fontSize: '0.95rem', color: '#4b5563' }}>
                                <strong>{property.location?.area}</strong>, {property.location?.district}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="agent-card">
                            <div className="price-display">
                                {formattedPrice}
                                <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '500', marginLeft: '5px' }}>
                                    {property.pricing?.negotiable ? '(Negotiable)' : ''}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                                    {property.listedBy?.profile_picture ? (
                                        <img src={property.listedBy.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={property.listedBy.name} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '1.25rem', color: '#1a1a1a', lineHeight: '1.2' }}>{property.listedBy?.name || 'Agent'}</div>
                                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
                                        {(property.listedBy as any)?.type ? (property.listedBy as any).type.charAt(0).toUpperCase() + (property.listedBy as any).type.slice(1) : 'Host'} • Joined {new Date(property.listedBy?.created_on || Date.now()).getFullYear()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button className="action-btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span>📅</span> Request a Tour
                                </button>

                                <a href={`tel:${property.listedBy?.contact_number || ''}`} className="action-btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                                    <span>📞</span> Contact {(property.listedBy as any)?.type === 'agency' ? 'Agency' : 'Agent'}
                                </a>

                                <a
                                    href={`https://wa.me/${property.listedBy?.contact_number?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(`I'm interested in the ${property.title} [#${property.id}], For the property, I'm willing to offer a price of ${formattedPrice}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="action-btn"
                                    style={{
                                        backgroundColor: '#25D366',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <span>💬</span> Make an Offer
                                </a>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#4b5563' }}>
                                    <span style={{ fontSize: '1.2rem' }}>❤</span>
                                    <span style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>Save</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#4b5563' }}>
                                    <span style={{ fontSize: '1.2rem' }}>📤</span>
                                    <span style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>Share</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
                                Report this listing
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommended Properties */}
                <div style={{ marginTop: '80px', borderTop: '1px solid #e5e7eb', paddingTop: '60px' }}>
                    <h2 className="section-title" style={{ marginBottom: '32px', fontSize: '1.75rem' }}>Recommended Properties</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '32px'
                    }}>
                        {recommendedProperties.map((p: any) => (
                            <PropertyCard key={p.id} property={{
                                id: p.id,
                                title: p.title,
                                price: new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(p.pricing?.price || 0).replace('NPR', 'Rs.'),
                                location: p.location ? `${p.location.area}, ${p.location.district}` : 'Unspecified',
                                specs: `${p.features?.bedrooms || 0} Beds • ${p.features?.bathrooms || 0} Baths`,
                                images: p.images.map((img: any) => img.url)
                            }} />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
