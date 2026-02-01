import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyMap from './PropertyMap';
import { SiteHeader } from '@/components/SiteHeader';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
    const [property, settings] = await Promise.all([
        prisma.property.findUnique({
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
        }),
        (prisma as any).systemSettings.findFirst()
    ]);

    if (!property) return notFound();

    // Fetch agent's total listing count
    const agentListingCount = await prisma.property.count({
        where: { listedById: property.listedById }
    });

    // Increment view count asynchronously
    await (prisma as any).property.update({
        where: { id: property.id },
        data: { views: { increment: 1 } }
    });

    const isLiked = session && property.property_likes.some(l => l.user_id === Number(session.id));
    const images = property.images.map(img => img.url);
    const locationStr = property.location
        ? `${property.location.area}, ${property.location.district}`
        : 'Unspecified';
    const priceValue = property.pricing?.price || 0;

    const specs = property.features
        ? `${property.features.bedrooms || 0}BHK • ${property.features.bathrooms || 0} Bath • ${property.features.builtUpArea || 0} ${property.features.builtUpAreaUnit || ''}`
        : 'Details unspecified';

    const mainCategory = property.types && property.types.length > 0
        ? property.types[0].name.charAt(0).toUpperCase() + property.types[0].name.slice(1)
        : 'Property';

    return (
        <main style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '100px' }}>
            <SiteHeader user={currentUser} />

            {/* Property Header Section */}
            <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '40px 0' }}>
                <div className="layout-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10172A', marginBottom: '8px', letterSpacing: '-0.02em' }}>{property.title}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.95rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {locationStr}</span>
                                <span style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '4px', fontWeight: '600', fontSize: '0.8rem' }}>#{property.propertyId || property.id}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#94a3b8' }}>
                            <div>Posted on: {new Date(property.created_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            <div>{property.views} views</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="layout-container" style={{ paddingTop: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '40px' }}>

                    {/* Left Column */}
                    <div>
                        {/* Interactive Gallery */}
                        <div style={{ display: 'flex', gap: '12px', height: '500px', marginBottom: '16px' }}>
                            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                                {images.length > 0 ? (
                                    <img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={property.title} />
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No Media Available</div>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {images.slice(0, 5).map((img: string, idx: number) => (
                                        <div key={idx} style={{
                                            flexShrink: 0,
                                            height: '85px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: idx === 0 ? '2px solid #b8960c' : '1px solid #e2e8f0',
                                            opacity: idx === 0 ? 1 : 0.7
                                        }}>
                                            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price Section below Image */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#b8960c' }}>
                                {new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(priceValue).replace('NPR', 'Rs.')}
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                            <section id="overview">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '32px' }}>Overview</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                                    <OverviewItem icon="📐" label="LAND AREA" value={property.features?.builtUpArea + ' ' + (property.features?.builtUpAreaUnit || 'sqft')} />
                                    <OverviewItem icon="🛣️" label="ROAD ACCESS" value={property.roadSize || 'Not set'} />
                                    <OverviewItem icon="🧭" label="FACING" value={property.facingDirection || 'Not set'} />
                                    <OverviewItem icon="🏢" label="FLOOR" value={property.features?.totalFloors || 'N/A'} />

                                    <OverviewItem icon="🚗" label="PARKING" value={property.features?.parkingAvailable ? 'Available' : 'None'} />
                                    <OverviewItem icon="🛏️" label="BEDROOM" value={property.features?.bedrooms || 'N/A'} />
                                    <OverviewItem icon="🚿" label="BATHROOM" value={property.features?.bathrooms || 'N/A'} />
                                    <OverviewItem icon="📅" label="BUILT YEAR" value="2080 BS" />

                                    <OverviewItem icon="🛋️" label="FURNISH STATUS" value={property.features?.furnishing || 'Unfurnished'} />
                                </div>
                            </section>

                            <section id="description">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Description</h2>
                                <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                                    {property.remarks || 'No detailed description provided for this premium listing.'}
                                </p>
                            </section>

                            {property.amenities && property.amenities.length > 0 && (
                                <section id="amenities">
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Nearby Amenities</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {property.amenities.map((amenity: any, idx: number) => {
                                            const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
                                            let displayIcon = getAmenityIcon(amenity.type);
                                            let displayName = amenity.name || (amenity.type.charAt(0).toUpperCase() + amenity.type.slice(1));

                                            // If name contains an emoji at the start, use it as the icon and strip it from the name
                                            const match = displayName.match(emojiRegex);
                                            if (match) {
                                                displayIcon = match[0];
                                                displayName = displayName.replace(displayIcon, '').trim();
                                            } else if (displayIcon !== '🔴') {
                                                // If no emoji in name but we have a standard icon, ensure it's not duplicated in name
                                                displayName = displayName.replace(displayIcon, '').trim();
                                            }

                                            return (
                                                <div key={idx} style={{ padding: '20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                        {displayIcon}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>{displayName}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{amenity.distance || 'Walking distance'}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            <section id="maps">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Location Map</h2>
                                <div style={{ height: '450px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
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
                            </section>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Agency Box */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#b8960c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                                    {property.listedBy?.profile_picture ? (
                                        <img src={property.listedBy.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (property.listedBy?.name || 'A')[0]}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{property.listedBy?.name || 'Unknown Agent'}</div>
                                    <div style={{ color: '#b8960c', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>{agentListingCount} Properties</div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <button style={{ padding: '10px', borderRadius: '8px', border: '1px solid #0066ff', color: '#0066ff', background: 'white', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    📞 Call Agency
                                </button>
                                <button style={{ padding: '10px', borderRadius: '8px', border: '1px solid #0066ff', color: '#0066ff', background: 'white', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    ✉️ Message Us
                                </button>
                            </div>
                            <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #0f172a', color: '#0f172a', background: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '12px' }}>
                                Book Site Visit
                            </button>
                            <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #b8960c', color: '#b8960c', background: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
                                Place an Offer
                            </button>
                        </div>

                        {/* Enquiry Form */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Enquiry Form</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <FormField label="Email" placeholder="Example: email@email.com" />
                                <FormField label="Name" placeholder="Full name" />
                                <FormField label="Phone" placeholder="+977 XXXXXXXXXX" />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Message</label>
                                    <textarea
                                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', minHeight: '80px', fontSize: '0.9rem', fontFamily: 'inherit' }}
                                        defaultValue={`I am interested in this property. [#${property.propertyId || property.id}]`}
                                    />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>I am</div>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                            <input type="radio" name="who" defaultChecked /> Buyer/Tenant
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                            <input type="radio" name="who" /> Agent
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                            <input type="radio" name="who" /> Other
                                        </label>
                                    </div>
                                </div>
                                <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #0066ff', color: '#0066ff', background: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px' }}>
                                    LOGIN TO ENQUIRE
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Share with Friends</div>
                            <button style={{ background: 'none', border: 'none', color: '#0066ff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                                ⚠️ Report this Property
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

function TabItem({ label, active = false }: { label: string, active?: boolean }) {
    return (
        <div style={{
            padding: '8px 24px',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: active ? '#b8960c' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.05em'
        }}>
            {label}
        </div>
    );
}

function OverviewItem({ icon, label, value }: { icon: string, label: string, value: any }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '1.5rem', width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.02em', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontWeight: '700', color: '#10172A', fontSize: '0.95rem' }}>{value}</div>
            </div>
        </div>
    );
}

function FormField({ label, placeholder }: { label: string, placeholder: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
            />
        </div>
    );
}

function getAmenityIcon(type: string): string {
    const icons: Record<string, string> = {
        hospital: '🏥', gym: '🏋️', park: '🌳', school: '🏫', pharmacy: '💊',
        restaurant: '🍴', hotel: '🏨', bank: '🏦', atm: '🏧', police: '👮',
        transport: '🚌', mall: '🛍️'
    };
    return icons[type.toLowerCase()] || '🔴';
}
