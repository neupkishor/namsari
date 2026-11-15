'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { LocationPolygons } from '@/services/properties/location-boundaries';

const MiniMap = dynamic(() => import('@/app/explore/MapComponent'), {
    ssr: false,
    loading: () => <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-500">Loading Map...</div>
});
const BoundaryMap = dynamic(() => import('./PropertyBoundaryMapCanvas'), {
    ssr: false,
    loading: () => <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-500">Loading Map...</div>
});
interface PropertyMapProps {
    property: {
        id: number;
        title: string;
        price: number;
        latitude?: number;
        longitude?: number;
        location: string;
    };
    images: string[];
    polygons?: LocationPolygons | null;
}

export default function PropertyMap({ property, images, polygons }: PropertyMapProps) {
    if (polygons?.length) {
        return <BoundaryMap polygons={polygons} />;
    }

    if (property.latitude == null || property.longitude == null) return null;

    return (
        <div className="relative isolate h-full w-full overflow-hidden">
            <MiniMap
                properties={[{
                    id: property.id,
                    title: property.title,
                    price: 'Price on Request',
                    price_listed: property.price > 0 ? property.price : null,
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
