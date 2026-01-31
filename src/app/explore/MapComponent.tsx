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

const UserLocationIcon = L.divIcon({
    html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
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
}

// Helper to auto-center map when properties change
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function MapComponent({
    properties,
    center = [27.7172, 85.324],
    userLocation,
    zoom = 13,
    onMarkerClick,
    selectedId,
    disablePopups = false
}: MapProps) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ChangeView center={center} zoom={zoom} />

            {/* User Current Location Circle */}
            {userLocation && (
                <>
                    <Circle
                        center={userLocation}
                        radius={500} // 500 meters radius
                        pathOptions={{
                            fillColor: '#3b82f6',
                            fillOpacity: 0.15,
                            color: '#3b82f6',
                            weight: 1,
                            opacity: 0.3
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
                        eventHandlers={{
                            click: () => onMarkerClick?.(p.id)
                        }}
                    >
                        {!disablePopups && (
                            <Popup>
                                <div style={{ minWidth: '180px', fontFamily: 'var(--font-outfit), sans-serif', padding: '4px' }}>
                                    <img
                                        src={p.images?.[0] || 'https://via.placeholder.com/150'}
                                        style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', height: '100px', objectFit: 'cover' }}
                                    />
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '4px' }}>{p.price}</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '4px', lineHeight: '1.2' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>📍</span> {p.location}
                                    </div>
                                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                                        <a
                                            href={`/properties/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.id}`}
                                            style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: '700', fontSize: '0.8rem' }}
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
