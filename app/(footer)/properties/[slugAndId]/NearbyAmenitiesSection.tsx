'use client';

import { useState } from 'react';

export type Amenity = {
    id: number | string;
    type: string;
    name?: string | null;
    distance?: string | null;
};

export function NearbyAmenitiesSection({ amenities }: { amenities: Amenity[] }) {
    const [expanded, setExpanded] = useState(false);
    const shouldCollapse = amenities.length > 6;

    return (
        <div className="nearby-amenities">
            <h2 className="section-title">Nearby Locations</h2>
            <div className={`nearby-amenities-grid ${shouldCollapse && !expanded ? 'nearby-amenities-grid-collapsed' : ''}`}>
                {amenities.map((amenity) => (
                    <div key={amenity.id} className="nearby-amenity-card">
                        <div className="nearby-amenity-card-main">
                            <span className="nearby-amenity-icon-chip" aria-hidden="true">
                                <span
                                    aria-hidden="true"
                                    className="nearby-amenity-icon"
                                    style={{
                                        WebkitMaskImage: `url(${getAmenityIcon(amenity.type, amenity.name)})`,
                                        maskImage: `url(${getAmenityIcon(amenity.type, amenity.name)})`
                                    }}
                                />
                            </span>
                            <div className="nearby-amenity-text">
                                <div className="nearby-amenity-title">{getLandmarkLabel(amenity)}</div>
                                <div className="nearby-amenity-distance">{amenity.distance || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {shouldCollapse ? (
                <button type="button" className="nearby-amenities-toggle" onClick={() => setExpanded((value) => !value)}>
                    {expanded ? 'Show fewer locations.' : `Show all ${amenities.length} locations.`}
                </button>
            ) : null}
        </div>
    );
}

function getLandmarkLabel(amenity: Amenity) {
    const raw = (amenity.name || amenity.type || '').replace(/_/g, ' ');
    return raw
        .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu, '')
        .trim();
}

function getAmenityIcon(type: string, name?: string | null) {
    const map: Record<string, string> = {
        hospital: '/icons/land-location.svg',
        school: '/icons/apartment.svg',
        park: '/icons/land-layer-location.svg',
        gym: '/icons/house-chimney.svg',
        pharmacy: '/icons/sack-dollar.svg',
        restaurant: '/icons/note.svg',
        hotel: '/icons/concierge-bell.svg',
        atm: '/icons/sack-dollar.svg',
        'police station': '/icons/land-location.svg',
        'public transport': '/icons/land-location.svg',
        'woda office': '/icons/apartment.svg',
        banquete: '/icons/note.svg',
        market: '/icons/land-layer-location.svg',
        shopping: '/icons/note.svg',
        bank: '/icons/sack-dollar.svg',
        airport: '/icons/plane-departure.svg'
    };

    const normalized = `${name || ''} ${type || ''}`.toLowerCase();

    // Prefer landmark-name meaning first.
    if (/(hospital|clinic|medical|health|nursing)/.test(normalized)) return '/icons/land-location.svg';
    if (/(school|college|campus|university|academy)/.test(normalized)) return '/icons/apartment.svg';
    if (/(park|garden|ground|playground|stadium)/.test(normalized)) return '/icons/land-layer-location.svg';
    if (/(gym|fitness|workout|sports)/.test(normalized)) return '/icons/house-chimney.svg';
    if (/(pharmacy|drug|medicine)/.test(normalized)) return '/icons/sack-dollar.svg';
    if (/(restaurant|cafe|coffee|food|eatery|bakery)/.test(normalized)) return '/icons/note.svg';
    if (/(hotel|resort|lodge|inn)/.test(normalized)) return '/icons/concierge-bell.svg';
    if (/(atm|bank|finance)/.test(normalized)) return '/icons/sack-dollar.svg';
    if (/(police|station|post)/.test(normalized)) return '/icons/land-location.svg';
    if (/(transport|bus|micro|taxi|metro|airport|terminal)/.test(normalized)) return '/icons/plane-departure.svg';
    if (/(market|bazaar|mall|shopping|store|mart)/.test(normalized)) return '/icons/land-layer-location.svg';
    if (/(office|woda|ward|municipality|government)/.test(normalized)) return '/icons/apartment.svg';

    return map[type.toLowerCase()] || '/icons/land-location.svg';
}
