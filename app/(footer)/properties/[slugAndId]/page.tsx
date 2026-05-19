import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyMap from './PropertyMap';
import { Header } from '@/components/menu/Header';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { RecommendedProperties } from '@/components/sections/RecommendedProperties';
import { PropertyEmiSection } from '@/components/sections/PropertyEmiSection';
import { SectionTitleFeed } from '@/components/sections/SectionTitleFeed';

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
    const currentUser = session ? await prisma.user.findUnique({ where: { id: Number(session.id) } }) : null;

    // Extract ID from slug-id format
    const parts = slugAndId.split('-');
    const idStr = parts[parts.length - 1];
    const id = parseInt(idStr);

    if (isNaN(id)) return notFound();

    // Fetch property and settings
    const property = await prisma.property.findUnique({
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
    await prisma.property.update({
        where: { id: property.id },
        data: { views: { increment: 1 } }
    });

    const isLiked = session && property.property_likes.some((l) => l.user_id === Number(session.id));
    const images = property.images.map((img) => img.url);
    const locationStr = property.location
        ? `${property.location.area}, ${property.location.district}`
        : 'Unspecified';
    const priceValue = property.pricing?.price || 0;
    const formattedPrice = new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(priceValue).replace('NPR', 'Rs.');
    const categorySuggestions = Array.from(
        new Set([
            ...(property.types?.map((t) => t.name).filter(Boolean) || []),
            'House',
            'Land',
            'Apartment',
            'Office Space'
        ])
    ).slice(0, 8);

    // Fetch recommended properties
    const recommendedProperties = await prisma.property.findMany({
        where: {
            id: { not: id },
            types: { some: { id: { in: property.types.map((t) => t.id) } } }
        },
        take: 8,
        orderBy: { created_on: 'desc' },
        include: {
            images: true,
            location: true,
            pricing: true,
            features: true
        }
    });
    const agentPropertyCount = await prisma.property.count({
        where: { listedById: property.listedById }
    });
    const contactNumber = property.listedBy?.contact_number || '';
    const formatNumberValue = (value?: number | null) => {
        if (value === null || value === undefined) return '-';
        return Number.isInteger(value) ? String(value) : String(value);
    };
    const builtUpUnit = property.features?.builtUpAreaUnit || 'sqft';
    const builtUpValue = formatNumberValue(property.features?.builtUpArea);
    const overviewItems = [
        { icon: '🛏️', value: formatNumberValue(property.features?.bedrooms), label: 'Bedrooms' },
        { icon: '🚿', value: formatNumberValue(property.features?.bathrooms), label: 'Bathrooms' },
        { icon: '📐', value: builtUpValue, label: builtUpUnit },
        { icon: '🏗️', value: String(new Date(property.created_on).getFullYear()), label: 'Year' },
        { icon: '🛣️', value: property.roadSize || '-', label: 'Road Access' },
        { icon: '🧭', value: property.facingDirection || '-', label: 'Facing' },
        { icon: '🏢', value: formatNumberValue(property.features?.totalFloors), label: 'Floors' },
        { icon: '🪑', value: property.features?.furnishing || '-', label: 'Furnish Status' }
    ];

    const amenityMainFeatures: { icon: string; label: string; detail?: string }[] = [];
    if (property.features?.parkingAvailable) amenityMainFeatures.push({ icon: '🚗', label: 'Parking' });
    if (property.features?.elevator) amenityMainFeatures.push({ icon: '🛗', label: 'Elevator' });
    if (property.features?.security) amenityMainFeatures.push({ icon: '🛡️', label: 'Security' });
    if (property.features?.waterSupply) amenityMainFeatures.push({ icon: '💧', label: 'Water Supply' });
    if (property.features?.electricity) amenityMainFeatures.push({ icon: '⚡', label: 'Electricity' });
    if (property.roadType) amenityMainFeatures.push({ icon: '🛤️', label: 'Road Type', detail: property.roadType });
    if (property.roadSize) amenityMainFeatures.push({ icon: '📏', label: 'Road Size', detail: property.roadSize });
    if (amenityMainFeatures.length === 0) {
        amenityMainFeatures.push(
            { icon: '💧', label: 'Water Supply' },
            { icon: '⚡', label: 'Electricity' },
            { icon: '🗑️', label: 'Drainage' }
        );
    }

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
                    overflow: hidden;
                    border-radius: 16px;
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
                    transition: transform 0.35s ease;
                    transform-origin: center;
                    display: block;
                }
                .gallery-item:hover {
                    transform: scale(1.05);
                }
                
                /* Layout Split */
                .content-split {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 64px;
                    align-items: start;
                    position: relative;
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
                
                /* Overview */
                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 14px;
                    margin-top: 18px;
                }
                .overview-card {
                    border: 1px solid #e5e7eb;
                    border-radius: 14px;
                    background: #fbfbfc;
                    padding: 16px 14px;
                    min-height: 116px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 6px;
                }
                .overview-icon {
                    font-size: 1.25rem;
                    line-height: 1;
                }
                .overview-value {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #1f2937;
                    line-height: 1.2;
                }
                .overview-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    line-height: 1.2;
                }

                /* Amenities */
                .amenity-group {
                    margin-bottom: 20px;
                }
                .amenity-group-title {
                    font-size: 0.85rem;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    font-weight: 700;
                    color: #475569;
                    margin-bottom: 10px;
                }
                .amenity-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 12px;
                }
                .amenity-tile {
                    border: 1px solid #e5e7eb;
                    background: #fafafa;
                    border-radius: 12px;
                    padding: 16px 12px;
                    min-height: 106px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    text-align: center;
                }
                .amenity-icon {
                    font-size: 1.45rem;
                    line-height: 1;
                }
                .amenity-name {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #1f2937;
                    line-height: 1.2;
                }
                .amenity-detail {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                }

                /* Agent Card */
                .sidebar-sticky {
                    position: sticky;
                    top: calc(var(--header-height, 72px) + 24px);
                    align-self: start;
                    height: fit-content;
                    max-height: calc(100vh - var(--header-height, 72px) - 40px);
                    overflow: auto;
                    scrollbar-width: thin;
                }
                .agent-card {
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
                .mobile-floating-agent {
                    display: none;
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

                /* Responsive */
                @media (max-width: 1024px) {
                    .content-split {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    .gallery-grid {
                        height: 400px;
                    }
                    .sidebar-sticky {
                        position: static;
                    }
                    .agent-card {
                        margin-top: 40px;
                    }
                }
                @media (max-width: 640px) {
                    .gallery-grid {
                        display: flex;
                        overflow-x: auto;
                        height: 260px;
                        scroll-snap-type: x mandatory;
                        border-radius: 0;
                        margin: -24px -16px 24px -16px;
                        gap: 0;
                    }
                    .gallery-main {
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
                        font-size: 1.5rem;
                    }
                    .prop-location {
                        font-size: 1rem;
                    }
                    .section-title {
                        font-size: 1.2rem;
                    }
                    .property-page-container {
                        padding: 24px 16px;
                    }
                    .overview-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                    .amenity-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }
                    .agent-card {
                        padding: 16px;
                    }
                    .price-display {
                        font-size: 1.4rem;
                    }
                    .sidebar-sticky {
                        display: none;
                    }
                    .mobile-floating-agent {
                        position: fixed;
                        left: 12px;
                        right: 12px;
                        bottom: 10px;
                        z-index: 60;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        background: #ffffff;
                        border: 1px solid #e5e7eb;
                        border-radius: 14px;
                        min-height: 74px;
                        padding: 12px;
                        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
                    }
                    .mobile-floating-agent-left {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        min-width: 0;
                    }
                    .mobile-floating-agent-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        overflow: hidden;
                        background: #f3f4f6;
                        flex-shrink: 0;
                    }
                    .mobile-floating-agent-price {
                        font-size: 0.95rem;
                        font-weight: 800;
                        color: #1f2937;
                        line-height: 1.1;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 120px;
                    }
                    .mobile-floating-agent-title {
                        font-size: 0.8rem;
                        font-weight: 700;
                        color: #475569;
                        line-height: 1.2;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 140px;
                        margin-bottom: 4px;
                    }
                    .mobile-floating-agent-actions {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        flex-shrink: 0;
                    }
                    .mobile-floating-btn {
                        width: 34px;
                        height: 34px;
                        border-radius: 9px;
                        border: 1px solid #d1d5db;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        text-decoration: none;
                        background: #fff;
                        color: #374151;
                        font-size: 1rem;
                    }
                    .mobile-floating-btn.call {
                        color: #b91c1c;
                        border-color: rgba(185, 28, 28, 0.25);
                        background: rgba(185, 28, 28, 0.06);
                    }
                    .mobile-floating-btn.whatsapp {
                        color: #16a34a;
                        border-color: rgba(22, 163, 74, 0.25);
                        background: rgba(22, 163, 74, 0.08);
                    }
                }

                /* Recommended Properties Section — handled by RecommendedProperties component */
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

                            <h2 className="section-title" style={{ marginBottom: '12px' }}>Overview</h2>
                            <div className="overview-grid">
                                {overviewItems.map((item) => (
                                    <div key={`${item.label}-${item.value}`} className="overview-card">
                                        <span className="overview-icon">{item.icon}</span>
                                        <div className="overview-value">{item.value}</div>
                                        <div className="overview-label">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h2 className="section-title">Amenities</h2>

                            <div className="amenity-group">
                                <div className="amenity-group-title">Main Features</div>
                                <div className="amenity-grid">
                                    {amenityMainFeatures.map((item) => (
                                        <div key={`${item.label}-${item.detail || ''}`} className="amenity-tile">
                                            <span className="amenity-icon">{item.icon}</span>
                                            <div className="amenity-name">{item.label}</div>
                                            {item.detail ? <div className="amenity-detail">{item.detail}</div> : null}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f3f4f6', overflow: 'hidden' }}>
                                    {property.listedBy?.profile_picture ? (
                                        <img src={property.listedBy.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={property.listedBy.name || 'User'} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👤</div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1a1a1a' }}>{property.listedBy?.name || 'Agent'}</div>
                                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{agentPropertyCount} {agentPropertyCount === 1 ? 'property' : 'properties'}</div>
                                </div>
                                {contactNumber && (
                                    <a
                                        href={`tel:${contactNumber}`}
                                        style={{
                                            marginLeft: 'auto',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            textDecoration: 'none',
                                            color: '#fff',
                                            background: 'var(--color-primary)',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        📞 {contactNumber}
                                    </a>
                                )}
                            </div>
                            <p style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#4b5563' }}>
                                {property.remarks || 'This property offers a perfect blend of luxury and comfort, situated in a prime location with easy access to all essential amenities.'}
                            </p>
                        </div>

                        {property.amenities && property.amenities.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <h2 className="section-title">Nearby Amenities</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '16px' }}>
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
                    <div className="sidebar-sticky">
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
                                        <img src={property.listedBy.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={property.listedBy.name || 'User'} />
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

                <section className="w-full mt-14">
                    <div className="mb-2">
                        <SectionTitleFeed
                            title="EMI Calculator"
                            description="Estimate your monthly EMI with adjustable down payment, interest rate, and term."
                        />
                    </div>
                    <PropertyEmiSection totalPrice={priceValue} />
                </section>

                {/* Recommended Properties */}
                <RecommendedProperties
                    properties={recommendedProperties.map((p) => ({
                        id: p.id,
                        title: p.title,
                        slug: p.slug || undefined,
                        price: p.pricing?.price ?? 0,
                        listedAt: p.created_on,
                        location: p.location ? `${p.location.area}, ${p.location.district}` : 'Unspecified',
                        specs: `${p.features?.bedrooms || 0} beds • ${p.features?.bathrooms || 0} baths`,
                        images: p.images.map((img) => img.url)
                    }))}
                />

                <section style={{ marginTop: '56px' }}>
                    <div style={{ marginBottom: '14px' }}>
                        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', lineHeight: 1.2 }}>
                            Property Collection
                        </h2>
                        <p style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>
                            Could not find property for your needs? Find by your category.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {categorySuggestions.map((category) => (
                            <Link
                                key={category}
                                href={`/explore?q=${encodeURIComponent(category)}`}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '10px 14px',
                                    borderRadius: '999px',
                                    border: '1px solid #e2e8f0',
                                    background: '#fff',
                                    color: '#1e293b',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    textDecoration: 'none'
                                }}
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            <div className="mobile-floating-agent">
                <div className="mobile-floating-agent-left">
                    <div className="mobile-floating-agent-avatar">
                        {property.listedBy?.profile_picture ? (
                            <img src={property.listedBy.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={property.listedBy.name || 'User'} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👤</div>
                        )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div className="mobile-floating-agent-title">{property.title}</div>
                        <div className="mobile-floating-agent-price">{formattedPrice}</div>
                    </div>
                </div>

                <div className="mobile-floating-agent-actions">
                    <a className="mobile-floating-btn call" href={`tel:${property.listedBy?.contact_number || ''}`} aria-label="Call agent">
                        📞
                    </a>
                    <a
                        className="mobile-floating-btn whatsapp"
                        href={`https://wa.me/${property.listedBy?.contact_number?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(`I'm interested in the ${property.title} [#${property.id}], For the property, I'm willing to offer a price of ${formattedPrice}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                    >
                        💬
                    </a>
                    <button className="mobile-floating-btn" aria-label="Like property" type="button">
                        ❤
                    </button>
                    <a className="mobile-floating-btn" href="#" aria-label="Share property">
                        📤
                    </a>
                </div>
            </div>
        </main>
    );
}
