'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MiniMap = dynamic(() => import('@/app/explore/MapComponent'), {
    ssr: false,
    loading: () => <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-500">Loading Map...</div>
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
        <div className="relative isolate h-full w-full overflow-hidden">
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
