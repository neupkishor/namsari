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
            <h2 className="section-title">Nearby Amenities</h2>
            <div className={`nearby-amenities-grid ${shouldCollapse && !expanded ? 'nearby-amenities-grid-collapsed' : ''}`}>
                {amenities.map((amenity) => (
                    <div key={amenity.id} className="nearby-amenity-card">
                        <div className="nearby-amenity-card-main">
                            <img src={getAmenityIcon(amenity.type)} alt="" aria-hidden="true" className="nearby-amenity-icon" />
                            <div className="nearby-amenity-text">
                                <div className="nearby-amenity-title">{amenity.type.replace(/_/g, ' ')}</div>
                                {amenity.name ? <div className="nearby-amenity-name">{amenity.name}</div> : null}
                            </div>
                        </div>
                        <div className="nearby-amenity-distance">{amenity.distance || 'N/A'}</div>
                    </div>
                ))}
            </div>
            {shouldCollapse ? (
                <button type="button" className="nearby-amenities-toggle" onClick={() => setExpanded((value) => !value)}>
                    {expanded ? 'Show fewer amenities.' : `Show all ${amenities.length} ammenities.`}
                </button>
            ) : null}
        </div>
    );
}

function getAmenityIcon(type: string) {
    const map: Record<string, string> = {
        hospital: '/icons/info.svg',
        school: '/icons/info.svg',
        park: '/icons/info.svg',
        gym: '/icons/info.svg',
        pharmacy: '/icons/info.svg',
        restaurant: '/icons/note.svg',
        hotel: '/icons/house-chimney.svg',
        atm: '/icons/sack-dollar.svg',
        'police station': '/icons/info.svg',
        'public transport': '/icons/land-location.svg',
        'woda office': '/icons/apartment.svg',
        banquete: '/icons/note.svg',
        market: '/icons/land-layer-location.svg',
        shopping: '/icons/note.svg',
        bank: '/icons/sack-dollar.svg',
        airport: '/icons/land-location.svg'
    };
    return map[type.toLowerCase()] || '/icons/info.svg';
}
