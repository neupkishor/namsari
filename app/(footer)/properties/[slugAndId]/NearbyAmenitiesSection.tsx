'use client';

import { useState } from 'react';

type Amenity = {
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
                            <img src={getAmenityIcon(amenity.type, amenity.name)} alt="" aria-hidden="true" className="nearby-amenity-icon" />
                            <div className="nearby-amenity-title">{getLandmarkLabel(amenity)}</div>
                        </div>
                        <div className="nearby-amenity-distance">{amenity.distance || 'N/A'}</div>
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
        hotel: '/icons/house-chimney.svg',
        atm: '/icons/sack-dollar.svg',
        'police station': '/icons/land-location.svg',
        'public transport': '/icons/land-location.svg',
        'woda office': '/icons/apartment.svg',
        banquete: '/icons/note.svg',
        market: '/icons/land-layer-location.svg',
        shopping: '/icons/note.svg',
        bank: '/icons/sack-dollar.svg',
        airport: '/icons/land-location.svg'
    };

    const normalized = `${name || ''} ${type || ''}`.toLowerCase();

    // Prefer landmark-name meaning first.
    if (/(hospital|clinic|medical|health|nursing)/.test(normalized)) return '/icons/land-location.svg';
    if (/(school|college|campus|university|academy)/.test(normalized)) return '/icons/apartment.svg';
    if (/(park|garden|ground|playground|stadium)/.test(normalized)) return '/icons/land-layer-location.svg';
    if (/(gym|fitness|workout|sports)/.test(normalized)) return '/icons/house-chimney.svg';
    if (/(pharmacy|drug|medicine)/.test(normalized)) return '/icons/sack-dollar.svg';
    if (/(restaurant|cafe|coffee|food|eatery|bakery)/.test(normalized)) return '/icons/note.svg';
    if (/(hotel|resort|lodge|inn)/.test(normalized)) return '/icons/house-chimney.svg';
    if (/(atm|bank|finance)/.test(normalized)) return '/icons/sack-dollar.svg';
    if (/(police|station|post)/.test(normalized)) return '/icons/land-location.svg';
    if (/(transport|bus|micro|taxi|metro|airport|terminal)/.test(normalized)) return '/icons/land-location.svg';
    if (/(market|bazaar|mall|shopping|store|mart)/.test(normalized)) return '/icons/land-layer-location.svg';
    if (/(office|woda|ward|municipality|government)/.test(normalized)) return '/icons/apartment.svg';

    return map[type.toLowerCase()] || '/icons/land-location.svg';
}
