'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Red marker for hovered/selected properties
const RedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const UserLocationIcon = L.divIcon({
    html: `<div class="bg-primary w-3 h-3 rounded-full border-2 border-white shadow-md animate-pulse"></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Property {
    id: number;
    title: string;
    price: string;
    latitude: number | null;
    longitude: number | null;
    location: string;
    images: string[];
}

interface MapProps {
    properties: Property[];
    center?: [number, number];
    userLocation?: [number, number] | null;
    zoom?: number;
    onMarkerClick?: (id: number) => void;
    selectedId?: number | null;
    disablePopups?: boolean;
    onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

// Helper to auto-center map when properties change and invalidate size to fix rendering bugs
function MapResizer({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.setView(center, zoom);
            // Invalidate size helps fix the "gray box" or "broken tiles" issue common in React-Leaflet
            setTimeout(() => {
                map.invalidateSize();
            }, 500);
        }
    }, [center, zoom, map]);
    return null;
}

// Track map bounds changes for area-based filtering
function BoundsTracker({ onBoundsChange }: { onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !onBoundsChange) return;

        let timeoutId: NodeJS.Timeout;

        const handleMoveEnd = () => {
            // Debounce to avoid too many API calls
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const bounds = map.getBounds();
                onBoundsChange({
                    north: bounds.getNorth(),
                    south: bounds.getSouth(),
                    east: bounds.getEast(),
                    west: bounds.getWest()
                });
            }, 1000); // Wait 1 second after user stops moving
        };

        map.on('moveend', handleMoveEnd);
        map.on('zoomend', handleMoveEnd);

        return () => {
            clearTimeout(timeoutId);
            map.off('moveend', handleMoveEnd);
            map.off('zoomend', handleMoveEnd);
        };
    }, [map, onBoundsChange]);

    return null;
}

export default function MapComponent({
    properties,
    center = [27.7172, 85.324],
    userLocation,
    zoom = 13,
    onMarkerClick,
    selectedId,
    disablePopups = false,
    onBoundsChange
}: MapProps) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full rounded-3xl"
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapResizer center={center} zoom={zoom} />
            <BoundsTracker onBoundsChange={onBoundsChange} />

            {/* User Current Location Circle */}
            {userLocation && (
                <>
                    <Circle
                        center={userLocation}
                        radius={500} // 500 meters radius
                        pathOptions={{
                            fillColor: '#2D3E50',
                            fillOpacity: 0.1,
                            color: '#2D3E50',
                            weight: 1,
                            opacity: 0.2
                        }}
                    />
                    <Marker position={userLocation} icon={UserLocationIcon} interactive={false} />
                </>
            )}

            {properties.map((p) => {
                const lat = typeof p.latitude === 'string' ? parseFloat(p.latitude) : p.latitude;
                const lng = typeof p.longitude === 'string' ? parseFloat(p.longitude) : p.longitude;

                if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

                const isSelected = selectedId === p.id;

                return (
                    <Marker
                        key={p.id}
                        position={[lat, lng]}
                        icon={isSelected ? RedIcon : DefaultIcon}
                        eventHandlers={{
                            click: () => onMarkerClick?.(p.id)
                        }}
                    >
                        {!disablePopups && (
                            <Popup className="property-popup">
                                <div className="min-w-[180px] font-sans p-1">
                                    <img
                                        src={p.images?.[0] || 'https://via.placeholder.com/150'}
                                        alt={p.title}
                                        className="w-full rounded-lg mb-3 h-[100px] object-cover"
                                    />
                                    <div className="font-extrabold text-lg text-primary mb-1">{p.price}</div>
                                    <div className="text-sm font-semibold text-primary/80 mb-1 leading-tight line-clamp-2">{p.title}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <span>📍</span> {p.location}
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-100">
                                        <a
                                            href={`/properties/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.id}`}
                                            className="text-gold no-underline font-bold text-xs hover:text-gold/80 transition-colors"
                                        >
                                            View Details →
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
