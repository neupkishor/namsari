'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatPrice } from '@/lib/formatters';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
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

function getCompactPriceLabel(price: unknown): string {
    const numeric = typeof price === 'number'
        ? price
        : Number(String(price ?? '').replace(/[^0-9.]/g, ''));

    if (!Number.isFinite(numeric) || numeric <= 0) return 'NRs';

    return `Rs ${formatPrice(numeric, true)}`;
}

function createPricePointerIcon(price: unknown, selected = false) {
    const label = getCompactPriceLabel(price);
    const border = selected ? '#820000' : '#DDE2E8';
    const text = selected ? '#820000' : '#1F2937';
    const shadow = selected
        ? '0 8px 16px rgba(130,0,0,0.22)'
        : '0 8px 16px rgba(15,23,42,0.16)';
    const tailShadow = selected
        ? 'drop-shadow(0 1px 0 #820000)'
        : 'drop-shadow(0 1px 0 #DDE2E8)';

    return L.divIcon({
        className: '',
        iconSize: [92, 44],
        iconAnchor: [46, 40],
        html: `
            <div style="position:relative;display:inline-flex;align-items:center;justify-content:center;padding:8px 12px;border-radius:9999px;background:#fff;border:1px solid ${border};box-shadow:${shadow};font:800 13px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:${text};white-space:nowrap;">
                ${label}
                <span style="position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:8px solid #fff;filter:${tailShadow};"></span>
            </div>
        `,
    });
}

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
    onMarkerHover?: (id: number) => void;
    onMarkerLeave?: (id: number) => void;
    selectedId?: number | null;
    disablePopups?: boolean;
    onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

// Helper to auto-center map when properties change and invalidate size to fix rendering bugs
function MapResizer({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    const previousViewRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);

    useEffect(() => {
        if (!map) return;

        const [lat, lng] = center;
        const previous = previousViewRef.current;
        const didViewChange = !previous || previous.lat !== lat || previous.lng !== lng || previous.zoom !== zoom;

        // Only force setView when the requested view actually changed.
        // This preserves user-controlled zoom/pan during normal re-renders.
        if (didViewChange) {
            map.setView(center, zoom);
            previousViewRef.current = { lat, lng, zoom };
        }

        // Invalidate size helps fix the "gray box" or "broken tiles" issue common in React-Leaflet
        setTimeout(() => {
            map.invalidateSize();
        }, 120);
    }, [center[0], center[1], zoom, map]);

    return null;
}

// Track map bounds changes for area-based filtering
function BoundsTracker({ onBoundsChange }: { onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !onBoundsChange) return;

        let timeoutId: NodeJS.Timeout;

        const emitBounds = () => {
            const bounds = map.getBounds();
            const nextBounds = {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            };

            if (Object.values(nextBounds).every((value) => Number.isFinite(value))) {
                onBoundsChange(nextBounds);
            }
        };

        const handleMoveEnd = () => {
            // Debounce to avoid too many API calls
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                emitBounds();
            }, 1000); // Wait 1 second after user stops moving
        };

        emitBounds();

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
    onMarkerHover,
    onMarkerLeave,
    selectedId,
    disablePopups = false,
    onBoundsChange
}: MapProps) {
    const [mapKey, setMapKey] = React.useState(0);
    const markerRefs = useRef<Map<number, L.Marker>>(new Map());

    useEffect(() => {
        // Force one fresh Leaflet instance after mount.
        // This avoids stale DOM references that can happen during Fast Refresh/HMR.
        setMapKey((current) => current + 1);
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        const marker = markerRefs.current.get(selectedId);
        marker?.setZIndexOffset(10000);
    }, [selectedId]);

    const displayPositionById = React.useMemo(() => {
        const grouped = new Map<string, { id: number; lat: number; lng: number }[]>();

        properties.forEach((property) => {
            const lat = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude;
            const lng = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude;
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

            const key = `${lat.toFixed(6)}:${lng.toFixed(6)}`;
            const current = grouped.get(key) || [];
            current.push({ id: property.id, lat, lng });
            grouped.set(key, current);
        });

        const positions = new Map<number, [number, number]>();

        grouped.forEach((group) => {
            const ordered = [...group].sort((a, b) => a.id - b.id);

            if (ordered.length === 1) {
                positions.set(ordered[0].id, [ordered[0].lat, ordered[0].lng]);
                return;
            }

            const radiusMeters = 22;
            ordered.forEach((item, index) => {
                const angle = (2 * Math.PI * index) / ordered.length;
                const latRadians = (item.lat * Math.PI) / 180;
                const latOffset = (radiusMeters / 111320) * Math.sin(angle);
                const lngOffset = (radiusMeters / (111320 * Math.max(Math.cos(latRadians), 0.2))) * Math.cos(angle);
                positions.set(item.id, [item.lat + latOffset, item.lng + lngOffset]);
            });
        });

        return positions;
    }, [properties]);

    return (
        <div className="relative isolate h-full w-full overflow-hidden rounded-3xl">
            <MapContainer
                key={mapKey}
                center={center}
                zoom={zoom}
                className="h-full w-full"
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

                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

                    const isSelected = selectedId === p.id;
                    const displayPosition = displayPositionById.get(p.id) || [lat, lng];

                    return (
                        <Marker
                            key={p.id}
                            position={displayPosition}
                            icon={createPricePointerIcon((p as any).pricing?.price ?? p.price, isSelected)}
                            zIndexOffset={isSelected ? 1000 : 0}
                            ref={(instance) => {
                                if (instance) {
                                    markerRefs.current.set(p.id, instance);
                                } else {
                                    markerRefs.current.delete(p.id);
                                }
                            }}
                            eventHandlers={{
                                click: () => onMarkerClick?.(p.id),
                                mouseover: () => onMarkerHover?.(p.id),
                                mouseout: () => onMarkerLeave?.(p.id),
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
        </div>
    );
}
