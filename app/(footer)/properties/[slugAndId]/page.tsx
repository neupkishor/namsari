import Link from 'next/link';
import { notFound } from 'next/navigation';
import { InternalPropertyLink } from '@/components/navigation/InternalPropertyLink';
import PropertyMap from './PropertyMap';
import PropertyImageCarousel from './PropertyImageCarousel';
import { NearbyAmenitiesSection } from './NearbyAmenitiesSection';
import type { Amenity } from './NearbyAmenitiesSection';
import PropertyOverviewGrid from './PropertyOverviewGrid';
import { Header } from '@/components/menu/Header';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { RecommendedProperties } from '@/components/sections/RecommendedProperties';
import { PropertyEmiSection } from '@/components/sections/PropertyEmiSection';
import { SectionTitleFeed } from '@/components/sections/SectionTitleFeed';
import { AutoScrollCarousel } from '@/components/ui/AutoScrollCarousel';
import { legacyPricingFromPrice } from '@/lib/pricing';

function isAmenity(value: unknown): value is Amenity {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    const id = candidate.id;
    const type = candidate.type;
    return (typeof id === 'string' || typeof id === 'number') && typeof type === 'string';
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slugAndId: string }> }) {
    const resolvedParams = await params;
    const { slugAndId } = resolvedParams;

    const session = await getSession();
    const currentUser = session ? await prisma.user.findUnique({ where: { id: Number(session.id) } }) : null;

    // Extract numeric ID from slug-id format (robust against malformed slug text)
    const idMatch = slugAndId.match(/(\d+)(?!.*\d)/);
    const id = idMatch ? parseInt(idMatch[1], 10) : NaN;

    if (isNaN(id)) return notFound();

    // Fetch property and settings
    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            listedBy: true,
            location: true,
            propertyPrices: {
                orderBy: { isDefault: 'desc' },
            },
            propertyMedia: {
                orderBy: { index: 'asc' },
            },
            features: true,
            comments: {
                include: { user: true },
                orderBy: { created_at: 'desc' }
            },
            property_likes: true
        }
    });

    if (!property) return notFound();

    const canEditProperty = currentUser?.id === property.listedById;

    const propertyWithLegacyPricing = {
        ...property,
        pricing: legacyPricingFromPrice((property.propertyPrices?.[0]?.base || null) as any),
    } as any;

    // Increment view count asynchronously
    await prisma.property.update({
        where: { id: property.id },
        data: { views: { increment: 1 } }
    });

    const isLiked = session && property.property_likes.some((l) => l.user_id === Number(session.id));
    const images = property.propertyMedia
        .filter((media) => media.type === 'image')
        .map((media) => media.resourceUrl);
    const locationStr = property.location
        ? `${property.location.area}, ${property.location.district}`
        : 'Unspecified';
    const priceValue = propertyWithLegacyPricing.pricing?.price || 0;
    const formattedPrice = new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(priceValue).replace('NPR', 'Rs.');
    const formatDevanagariPrice = (value: number) => {
        if (!Number.isFinite(value) || value <= 0) return 'Price on request';

        const crore = 1_00_00_000;
        const lakh = 1_00_000;
        const thousand = 1_000;
        const parts: string[] = [];
        let remainder = Math.floor(value);

        if (remainder >= crore) {
            const croreCount = Math.floor(remainder / crore);
            parts.push(`${croreCount}Crore`);
            remainder %= crore;
        }

        if (remainder >= lakh) {
            const lakhCount = Math.floor(remainder / lakh);
            parts.push(`${lakhCount}Lakhs`);
            remainder %= lakh;
        }

        if (remainder >= thousand) {
            const thousandCount = Math.floor(remainder / thousand);
            parts.push(`${thousandCount}Hajar`);
            remainder %= thousand;
        }

        if (remainder > 0 || parts.length === 0) {
            parts.push(String(remainder));
        }

        return parts.join(' ');
    };
    const formattedDevanagariPrice = formatDevanagariPrice(priceValue);
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
    const recommendedProperties = (await prisma.property.findMany({
        where: {
            id: { not: id },
            types: { hasSome: property.types }
        },
        take: 8,
        orderBy: { created_on: 'desc' },
        include: {
            propertyPrices: { orderBy: { isDefault: 'desc' } },
            propertyMedia: { orderBy: { index: 'asc' } },
            location: true,
            features: true
        }
    })).map((item: any) => ({
        ...item,
        pricing: legacyPricingFromPrice((item.propertyPrices?.[0]?.base || null) as any),
    }));
    const collectionPresets = [
        'house for sale under 2 crore',
        'house for sale under 3 crore',
        'flat for rent under 50k',
        'land for sale under 30 lakhs per aana',
        'land for sale under 40 lakhs per aana'
    ];
    const collectionCards = collectionPresets.map((title, index) => {
        const currentMainImage = (property as any).mainMedia || '';
        const primaryImage = currentMainImage || recommendedProperties[index]?.images?.[0]?.url || property.images[index]?.url || property.images[0]?.url || '';
        return {
            key: `${title}-${index}`,
            title,
            description: 'Find matching listings curated for this budget.',
            image: primaryImage,
            href: `/explore?q=${encodeURIComponent(title)}`
        };
    });
    const agentPropertyCount = await prisma.property.count({
        where: { listedById: property.listedById }
    });
    const contactNumber = property.listedBy?.contact_number || '';
    const formatNumberValue = (value?: number | null) => {
        if (value === null || value === undefined) return '-';
        return Number.isInteger(value) ? String(value) : String(value);
    };
    const formatCountLabel = (count: string, label: string) => `${count} ${label.toLowerCase()}`;
    const builtUpUnit = property.features?.builtUpAreaUnit || 'sqft';
    const builtUpAreaNumeric = property.features?.builtUpArea ?? null;
    const builtUpValue = formatNumberValue(builtUpAreaNumeric);
    const overviewItems = [
        { icon: '/icons/house-chimney.svg', value: formatNumberValue(property.features?.bedrooms), label: 'bedrooms', displayValue: formatCountLabel(formatNumberValue(property.features?.bedrooms), 'bedrooms') },
        { icon: '/icons/info.svg', value: formatNumberValue(property.features?.bathrooms), label: 'bathrooms', displayValue: formatCountLabel(formatNumberValue(property.features?.bathrooms), 'bathrooms') },
        { icon: '/icons/land-layer-location.svg', value: builtUpValue, label: 'area', displayValue: `${builtUpValue} ${builtUpUnit.toLowerCase()}` },
        { icon: '/icons/calendar.svg', value: String(new Date(property.created_on).getFullYear()), label: 'Year', displayValue: String(new Date(property.created_on).getFullYear()) },
        { icon: '/icons/land-location.svg', value: property.roadSize || '-', label: 'Road Access', displayValue: property.roadSize || '-' },
        { icon: '/icons/three-direction.svg', value: property.facingDirection || '-', label: 'Facing', displayValue: property.facingDirection || '-' },
        { icon: '/icons/apartment.svg', value: formatNumberValue(property.features?.totalFloors), label: 'floors', displayValue: formatCountLabel(formatNumberValue(property.features?.totalFloors), 'floors') },
        { icon: '/icons/note.svg', value: property.features?.furnishing || '-', label: 'Furnish Status', displayValue: String(property.features?.furnishing || '-').toLowerCase() }
    ];

    const amenityMainFeatures: { icon: string; label: string; detail?: string }[] = [];
    if (property.features?.parkingAvailable) amenityMainFeatures.push({ icon: '/icons/house-chimney.svg', label: 'Parking' });
    if (property.features?.elevator) amenityMainFeatures.push({ icon: '/icons/apartment.svg', label: 'Elevator' });
    if (property.features?.security) amenityMainFeatures.push({ icon: '/icons/info.svg', label: 'Security' });
    if (property.features?.waterSupply) amenityMainFeatures.push({ icon: '/icons/faucet.svg', label: 'Water Supply' });
    if (property.features?.electricity) amenityMainFeatures.push({ icon: '/icons/plug-alt.svg', label: 'Electricity' });
    if (property.roadType) amenityMainFeatures.push({ icon: '/icons/land-location.svg', label: 'Road Type', detail: property.roadType });
    if (property.roadSize) amenityMainFeatures.push({ icon: '/icons/land-layer-location.svg', label: 'Road Size', detail: property.roadSize });
    if (amenityMainFeatures.length === 0) {
        amenityMainFeatures.push(
            { icon: '/icons/faucet.svg', label: 'Water Supply' },
            { icon: '/icons/plug-alt.svg', label: 'Electricity' },
            { icon: '/icons/bridge-water.svg', label: 'Drainage' }
        );
    }
    const nearbyAmenities = Array.isArray(property.amenities)
        ? property.amenities.filter(isAmenity)
        : [];

    return (
        <main style={{ backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '100px', paddingTop: 'var(--header-height, 72px)', overflowX: 'clip' }}>
            <Header user={currentUser} />

            <style dangerouslySetInnerHTML={{
                __html: `
                .property-page-container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 24px;
                    box-sizing: border-box;
                    overflow-x: clip;
                }
                
                /* Gallery Grid */
                .gallery-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 12px;
                    height: 440px;
                    border-radius: 16px;
                    overflow: hidden;
                    margin-bottom: 28px;
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
                .mobile-property-carousel {
                    display: none;
                }
                .property-collection-card {
                    position: relative;
                    height: 240px;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    text-decoration: none;
                    color: #fff;
                    display: block;
                }
                .property-collection-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .property-collection-card:hover .property-collection-image {
                    transform: scale(1.05);
                }
                .property-collection-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0, 0, 0, 0.84) 0%, rgba(0, 0, 0, 0.58) 42%, rgba(0, 0, 0, 0.14) 72%, rgba(0, 0, 0, 0) 100%);
                }
                .property-collection-content {
                    position: absolute;
                    inset: 0;
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    gap: 8px;
                    z-index: 2;
                }
                .property-collection-title {
                    margin: 0;
                    font-size: 1.1rem;
                    line-height: 1.25;
                    font-weight: 800;
                    color: #fff;
                    text-transform: capitalize;
                }
                .property-collection-desc {
                    margin: 2px 0 0;
                    font-size: 0.84rem;
                    line-height: 1.25;
                    color: rgba(255, 255, 255, 0.9);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* Layout Split */
                .content-split {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 32px;
                    align-items: start;
                    position: relative;
                }
                .content-split > div {
                    min-width: 0;
                }
                
                /* Typography */
                .prop-title {
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                    line-height: 1.2;
                    overflow-wrap: anywhere;
                }
                .prop-location {
                    font-size: 1.1rem;
                    color: #4b5563;
                    margin-bottom: 24px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .prop-location-icon {
                    width: 16px;
                    height: 16px;
                    object-fit: contain;
                    flex-shrink: 0;
                }
                .section-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 20px;
                }
                
                /* Overview */
                .overview-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    overflow: visible;
                    padding-bottom: 6px;
                    padding-right: 4px;
                    margin-top: 18px;
                    width: 100%;
                }
                .overview-card {
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    background: #fcfcfd;
                    padding: 10px 12px;
                    min-height: 72px;
                    min-width: 118px;
                    flex: 0 0 calc(25% - 9px);
                    max-width: calc(25% - 9px);
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    justify-content: center;
                    transition: border-color 0.28s ease, background-color 0.28s ease;
                }
                .overview-card:hover {
                    border-color: var(--color-primary);
                    background: #ffffff;
                }
                .overview-content {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    min-height: 100%;
                }
                .overview-icon {
                    width: 18px;
                    height: 18px;
                    display: inline-block;
                    background-color: #475569;
                    -webkit-mask-size: contain;
                    mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    mask-position: center;
                    flex-shrink: 0;
                    transition: background-color 0.28s ease;
                }
                .overview-icon-chip {
                    width: 30px;
                    height: 30px;
                    border-radius: 10px;
                    background: transparent;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: background-color 0.28s ease;
                }
                .overview-card:hover .overview-icon-chip {
                    background: transparent;
                }
                .overview-card:hover .overview-icon {
                    background-color: var(--color-primary);
                }
                .overview-value {
                    font-size: 0.84rem;
                    font-weight: 800;
                    color: #1f2937;
                    line-height: 1.2;
                    text-align: left;
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
                .amenity-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    max-height: calc((72px * 3) + (12px * 2));
                    overflow: hidden;
                }
                .amenity-tile {
                    border: 1px solid #e5e7eb;
                    background: #fcfcfd;
                    border-radius: 12px;
                    padding: 10px 12px;
                    min-height: 72px;
                    min-width: 118px;
                    flex: 0 0 calc(25% - 9px);
                    max-width: calc(25% - 9px);
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    text-align: left;
                    transition: border-color 0.28s ease, background-color 0.28s ease;
                }
                .amenity-tile:hover {
                    border-color: var(--color-primary);
                    background: #ffffff;
                }
                .amenity-icon {
                    width: 18px;
                    height: 18px;
                    display: inline-block;
                    background-color: #475569;
                    -webkit-mask-size: contain;
                    mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    mask-position: center;
                    flex-shrink: 0;
                    transition: background-color 0.28s ease;
                }
                .amenity-icon-chip {
                    width: 30px;
                    height: 30px;
                    border-radius: 10px;
                    background: transparent;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: background-color 0.28s ease;
                }
                .amenity-tile:hover .amenity-icon-chip {
                    background: transparent;
                }
                .amenity-tile:hover .amenity-icon {
                    background-color: var(--color-primary);
                }
                .amenity-name {
                    font-size: 0.84rem;
                    font-weight: 800;
                    color: #1f2937;
                    line-height: 1.2;
                }
                .amenity-detail {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                }
                .nearby-amenities {
                    margin-bottom: 40px;
                }
                .nearby-amenities-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 16px;
                    margin-top: 4px;
                }
                .nearby-amenities-grid-collapsed {
                    max-height: calc((88px * 3) + (16px * 2));
                    overflow: hidden;
                }
                .nearby-amenity-card {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 10px;
                    padding: 16px;
                    min-height: 88px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    background: #ffffff;
                    box-sizing: border-box;
                    transition: border-color 0.28s ease, background-color 0.28s ease;
                }
                .nearby-amenity-card:hover {
                    border-color: var(--color-primary);
                    background: #ffffff;
                }
                .nearby-amenity-card-main {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
                    width: 100%;
                }
                .nearby-amenity-icon {
                    width: 22px;
                    height: 22px;
                    display: inline-block;
                    background-color: #475569;
                    -webkit-mask-size: contain;
                    mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    mask-position: center;
                    flex-shrink: 0;
                    transition: background-color 0.28s ease;
                }
                .nearby-amenity-icon-chip {
                    width: 34px;
                    height: 34px;
                    border-radius: 11px;
                    background: transparent;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .nearby-amenity-card:hover .nearby-amenity-icon {
                    background-color: var(--color-primary);
                }
                .nearby-amenity-text {
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .nearby-amenity-title {
                    font-weight: 600;
                    color: #1a1a1a;
                    text-transform: capitalize;
                    line-height: 1.2;
                    overflow-wrap: anywhere;
                }
                .nearby-amenity-name {
                    font-size: 0.85rem;
                    color: #6b7280;
                    line-height: 1.2;
                    margin-top: 2px;
                    overflow-wrap: anywhere;
                }
                .nearby-amenity-distance {
                    font-weight: 600;
                    color: #64748b;
                    font-size: 0.82rem;
                }
                .nearby-amenities-toggle {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 16px;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    background: #f8fafc;
                    color: #334155;
                    font-weight: 700;
                    font-size: 0.92rem;
                    cursor: pointer;
                    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
                }
                .nearby-amenities-toggle:hover {
                    background: #eef2f7;
                    border-color: #94a3b8;
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
                        gap: 24px;
                    }
                    .gallery-grid {
                        height: 340px;
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
                        display: none;
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
                        padding: 16px 12px 108px;
                    }
                    .overview-grid {
                        flex-wrap: nowrap;
                        overflow-x: auto;
                        overflow-y: hidden;
                        scroll-snap-type: x proximity;
                        -webkit-overflow-scrolling: touch;
                        overscroll-behavior-x: contain;
                        touch-action: pan-x;
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .overview-grid::-webkit-scrollbar {
                        display: none;
                    }
                    .overview-card {
                        flex: 0 0 auto;
                        max-width: none;
                    }
                    .amenity-grid {
                        max-height: calc((72px * 3) + (12px * 2));
                    }
                    .amenity-tile {
                        flex: 0 0 calc(50% - 6px);
                        max-width: calc(50% - 6px);
                        gap: 12px;
                    }
                    .nearby-amenities-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                    .agent-card {
                        padding: 16px;
                    }
                    .price-display {
                        font-size: 1.4rem;
                    }
                    .mobile-property-carousel {
                        display: block;
                        position: relative;
                        height: 260px;
                        border-radius: 12px;
                        overflow: hidden;
                        margin-bottom: 24px;
                    }
                    .mobile-property-carousel-track {
                        height: 100%;
                        display: flex;
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }
                    .mobile-property-carousel-track::-webkit-scrollbar {
                        display: none;
                    }
                    .mobile-property-carousel-slide {
                        min-width: 100%;
                        height: 100%;
                        scroll-snap-align: start;
                    }
                    .mobile-property-carousel-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        display: block;
                    }
                    .mobile-property-carousel-top {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        right: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        pointer-events: none;
                    }
                    .mobile-property-carousel-count {
                        background: rgba(15, 23, 42, 0.62);
                        color: #fff;
                        font-size: 0.75rem;
                        font-weight: 700;
                        border-radius: 999px;
                        padding: 4px 10px;
                    }
                    .mobile-property-carousel-dots {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        background: rgba(15, 23, 42, 0.45);
                        border-radius: 999px;
                        padding: 5px 9px;
                    }
                    .mobile-property-carousel-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 999px;
                        background: rgba(255, 255, 255, 0.55);
                    }
                    .mobile-property-carousel-dot.active {
                        background: #ffffff;
                        width: 14px;
                    }
                    .sidebar-sticky {
                        display: none;
                    }
                    .mobile-floating-agent {
                        position: fixed;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 60;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        background: #ffffff;
                        border-top: 1px solid #e5e7eb;
                        border-left: 0;
                        border-right: 0;
                        border-bottom: 0;
                        border-radius: 18px 18px 0 0;
                        min-height: 84px;
                        padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
                        box-shadow: 0 -10px 24px rgba(15, 23, 42, 0.08);
                        box-sizing: border-box;
                        max-width: 100vw;
                        overflow: hidden;
                    }
                    .mobile-floating-agent-left {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        min-width: 0;
                        flex: 1;
                    }
                    .mobile-floating-agent-avatar {
                        width: 44px;
                        height: 44px;
                        border-radius: 14px;
                        overflow: hidden;
                        background: #f3f4f6;
                        flex-shrink: 0;
                    }
                    .mobile-floating-agent-price {
                        font-size: 0.98rem;
                        font-weight: 800;
                        color: #0f172a;
                        line-height: 1.1;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 120px;
                    }
                    .mobile-floating-agent-title {
                        font-size: 0.86rem;
                        font-weight: 700;
                        color: #64748b;
                        line-height: 1.2;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 180px;
                        margin-bottom: 4px;
                    }
                    .mobile-floating-agent-actions {
                        display: flex;
                        align-items: center;
                        gap: 0;
                        flex-shrink: 0;
                        min-width: 0;
                    }
                    .mobile-floating-call-btn {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        min-width: 0;
                        min-height: 48px;
                        padding: 0 14px;
                        border-radius: 14px;
                        border: 1px solid var(--color-primary);
                        text-decoration: none;
                        background: var(--color-primary);
                        color: #fff;
                        font-size: 0.9rem;
                        font-weight: 800;
                        letter-spacing: 0.01em;
                        box-shadow: 0 6px 14px rgba(130, 0, 0, 0.14);
                        transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
                        white-space: nowrap;
                    }
                    .mobile-floating-call-btn:hover,
                    .mobile-floating-call-btn:active,
                    .mobile-floating-call-btn:focus {
                        transform: translateY(-1px);
                        box-shadow: 0 8px 18px rgba(130, 0, 0, 0.18);
                        color: #fff;
                        background: var(--color-primary);
                        border-color: var(--color-primary);
                    }
                    .mobile-floating-call-btn:active {
                        transform: translateY(0);
                        box-shadow: 0 5px 12px rgba(130, 0, 0, 0.14);
                    }
                    .property-collection-title {
                        font-size: 1rem;
                    }
                    .property-collection-desc {
                        font-size: 0.8rem;
                    }
                }

                /* Recommended Properties Section — handled by RecommendedProperties component */
            `}} />

            <div className="property-page-container">
                {/* Header Info (Mobile Only - usually good to have title first on mobile, but preserving consistent DOM) */}

                <PropertyImageCarousel images={images} galleryHref={`/properties/${slugAndId}/gallery`} />

                {/* Image Gallery */}
                {/* Image Gallery */}
                <div className="gallery-grid" style={{
                    gridTemplateColumns: images.length <= 1 ? '1fr' : images.length === 2 ? '1fr 1fr' : '2fr 1fr'
                }}>
                    <div className="gallery-main">
                        {images.length > 0 ? (
                            <InternalPropertyLink href={`/properties/${slugAndId}/gallery`} style={{ display: 'block', height: '100%', width: '100%' }}>
                                <img src={images[0]} className="gallery-item" alt="Main View" />
                            </InternalPropertyLink>
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Image</div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="gallery-side" style={{
                            gridTemplateRows: images.length === 2 ? '1fr' : '1fr 1fr'
                        }}>
                            <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
                                <InternalPropertyLink href={`/properties/${slugAndId}/gallery`} style={{ display: 'block', height: '100%', width: '100%' }}>
                                    <img src={images[1]} className="gallery-item" alt="View 2" />
                                </InternalPropertyLink>
                            </div>
                            {images.length > 2 && (
                                <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
                                    <InternalPropertyLink href={`/properties/${slugAndId}/gallery`} style={{ display: 'block', height: '100%', width: '100%', position: 'relative' }}>
                                        <img src={images[2]} className="gallery-item" alt="View 3" />
                                        {images.length > 3 && (
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1.25rem' }}>
                                                +{images.length - 3} more
                                            </div>
                                        )}
                                    </InternalPropertyLink>
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
                            <div className="prop-location">
                                <img src="/icons/land-location.svg" alt="" aria-hidden="true" className="prop-location-icon" />
                                <span>{locationStr}</span>
                            </div>

                            <h2 className="section-title" style={{ marginBottom: '12px' }}>Overview</h2>
                            <PropertyOverviewGrid
                                items={overviewItems}
                                builtUpAreaValue={builtUpAreaNumeric}
                                builtUpAreaUnit={builtUpUnit}
                            />
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h2 className="section-title">Amenities</h2>

                            <div className="amenity-group">
                                <div className="amenity-grid">
                                    {amenityMainFeatures.map((item) => (
                                        <div key={`${item.label}-${item.detail || ''}`} className="amenity-tile">
                                            <span className="amenity-icon-chip" aria-hidden="true">
                                                <span
                                                    aria-hidden="true"
                                                    className="amenity-icon"
                                                    style={{ WebkitMaskImage: `url(${item.icon})`, maskImage: `url(${item.icon})` }}
                                                />
                                            </span>
                                            <div>
                                                <div className="amenity-name">{item.label}</div>
                                                {item.detail ? <div className="amenity-detail">{item.detail}</div> : null}
                                            </div>
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
                                    <div style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 700 }}>{agentPropertyCount} {agentPropertyCount === 1 ? 'property' : 'properties'}</div>
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

                        {nearbyAmenities.length > 0 && <NearbyAmenitiesSection amenities={nearbyAmenities} />}

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
                                    {propertyWithLegacyPricing.pricing?.negotiable ? '(Negotiable)' : ''}
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

                            {canEditProperty && (
                                <Link
                                    href={`/manage/properties/${slugAndId}`}
                                    className="action-btn btn-outline"
                                    style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', textDecoration: 'none' }}
                                >
                                    Edit Property
                                </Link>
                            )}

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
                        images: (p.propertyMedia || [])
                            .filter((media: { type: string }) => media.type === 'image')
                            .map((media: { resourceUrl: string }) => media.resourceUrl)
                    }))}
                />

                <section style={{ marginTop: '56px' }}>
                    <div style={{ marginBottom: '14px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px', lineHeight: 1.2 }}>
                            Property Collection
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                            Could not find property for your needs? Find by your category.
                        </p>
                    </div>

                    <AutoScrollCarousel
                        gap="12px"
                        desktopItemCount={4}
                        laptopItemCount={3}
                        tabletItemCount={2}
                        mobileItemCount={1.2}
                        smallMobileItemCount={1.1}
                        padding="4px 2px 8px"
                    >
                        {collectionCards.map((card) => (
                            <Link key={card.key} href={card.href} className="property-collection-card">
                                {card.image ? (
                                    <img src={card.image} alt={card.title} className="property-collection-image" />
                                ) : (
                                    <div className="property-collection-image" style={{ background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)' }} />
                                )}
                                <div className="property-collection-overlay" />
                                <div className="property-collection-content">
                                    <h3 className="property-collection-title">{card.title}</h3>
                                    <p className="property-collection-desc">{card.description}</p>
                                </div>
                            </Link>
                        ))}
                    </AutoScrollCarousel>
                </section>
            </div>

            <div className="mobile-floating-agent">
                <div className="mobile-floating-agent-left">
                    <div className="mobile-floating-agent-avatar">
                        {property.listedBy?.profile_picture ? (
                            <img src={property.listedBy.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={property.listedBy.name || 'User'} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="/icons/info.svg" alt="" aria-hidden="true" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div className="mobile-floating-agent-title">{property.title}</div>
                        <div className="mobile-floating-agent-price">{formattedDevanagariPrice}</div>
                    </div>
                </div>

                <div className="mobile-floating-agent-actions">
                    <a
                        className="mobile-floating-call-btn"
                        href={`tel:${property.listedBy?.contact_number || ''}`}
                        aria-label="Call agent"
                    >
                        Call Agent
                    </a>
                </div>
            </div>
        </main>
    );
}
