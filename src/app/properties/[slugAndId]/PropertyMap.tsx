'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MiniMap = dynamic(() => import('@/app/explore/MapComponent'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', width: '100%', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
});

interface PropertyMapProps {
    property: {
        id: number;
        title: string;
        price: number;
        latitude: number;
        longitude: number;
        location: string;
    };
    images: string[];
}

export default function PropertyMap({ property, images }: PropertyMapProps) {
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MiniMap
                properties={[{
                    id: property.id,
                    title: property.title,
                    price: new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(property.price).replace('NPR', 'NRs.'),
                    latitude: property.latitude,
                    longitude: property.longitude,
                    location: property.location,
                    images: images
                }]}
                center={[property.latitude, property.longitude]}
                zoom={15}
                disablePopups={true}
            />
        </div>
    );
}
