'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
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
    zoom?: number;
    onMarkerClick?: (id: number) => void;
    selectedId?: number | null;
}

// Helper to auto-center map when properties change
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function MapComponent({ properties, center = [27.7172, 85.324], zoom = 13, onMarkerClick, selectedId }: MapProps) {
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

            {properties.map((p) => {
                if (!p.latitude || !p.longitude) return null;

                const isSelected = selectedId === p.id;

                return (
                    <Marker
                        key={p.id}
                        position={[p.latitude, p.longitude]}
                        eventHandlers={{
                            click: () => onMarkerClick?.(p.id)
                        }}
                    >
                        <Popup>
                            <div style={{ minWidth: '150px' }}>
                                <img
                                    src={p.images?.[0] || 'https://via.placeholder.com/150'}
                                    style={{ width: '100%', borderRadius: '4px', marginBottom: '8px', height: '80px', objectFit: 'cover' }}
                                />
                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.price}</div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{p.title}</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>{p.location}</div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
