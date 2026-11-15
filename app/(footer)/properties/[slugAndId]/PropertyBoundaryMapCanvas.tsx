'use client';

import { useEffect } from 'react';
import { MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationPolygons } from '@/services/properties/location-boundaries';

// Fits the map to the selected location boundary after the map mounts.
function FitBoundary({ polygons }: { polygons: LocationPolygons }) {
    const map = useMap();

    useEffect(() => {
        const points = polygons.flat(2).map(([latitude, longitude]) => L.latLng(latitude, longitude));
        if (points.length > 0) map.fitBounds(L.latLngBounds(points), { padding: [20, 20], maxZoom: 15 });
    }, [map, polygons]);

    return null;
}

// Displays the most specific available location polygon.
export default function PropertyBoundaryMapCanvas({ polygons }: { polygons: LocationPolygons }) {
    const center = polygons[0]?.[0]?.[0];
    if (!center) return null;

    return (
        <MapContainer center={center} zoom={8} className="h-full w-full" scrollWheelZoom>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBoundary polygons={polygons} />
            {polygons.map((polygon, index) => (
                <Polygon
                    key={index}
                    positions={polygon}
                    pathOptions={{ color: '#820000', weight: 2, fillColor: '#820000', fillOpacity: 0.16 }}
                />
            ))}
        </MapContainer>
    );
}
