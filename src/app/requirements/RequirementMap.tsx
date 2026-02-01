'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';

// Fix for default marker icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const UserLocationIcon = L.divIcon({
    html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 50px rgba(59, 130, 246, 0.5);"></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationSelector({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function SearchField() {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();
        // @ts-ignore
        const searchControl = new GeoSearchControl({
            provider: provider,
            style: 'bar',
            showMarker: false,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: 'Search for a location...',
        });

        map.addControl(searchControl);

        const handleShowLocation = (result: any) => {
            // We can handle the result here if needed, 
            // but the map will already pan to the location.
        };

        map.on('geosearch/showlocation', handleShowLocation);

        return () => {
            map.removeControl(searchControl);
            map.off('geosearch/showlocation', handleShowLocation);
        };
    }, [map]);

    return null;
}

function MapResizer() {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 500);
    }, [map]);
    return null;
}

interface RequirementMapProps {
    selectedLocation: [number, number] | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function RequirementMap({ selectedLocation, onLocationSelect }: RequirementMapProps) {
    const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
    const center: [number, number] = selectedLocation || [27.7172, 85.324];

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLoc([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => console.log('Geolocation error:', err)
            );
        }
    }, []);

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
            <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizer />
                <SearchField />
                <LocationSelector onLocationSelect={onLocationSelect} />

                {userLoc && (
                    <Marker position={userLoc} icon={UserLocationIcon} interactive={false} />
                )}

                {selectedLocation && (
                    <>
                        <Marker position={selectedLocation} />
                        <Circle
                            center={selectedLocation}
                            radius={500}
                            pathOptions={{
                                fillColor: '#b8960c',
                                fillOpacity: 0.2,
                                color: '#b8960c',
                                weight: 2,
                                dashArray: '5, 5'
                            }}
                        />
                    </>
                )}
            </MapContainer>
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', color: '#64748b', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>
                Click map to set center. Search above for locations.
            </div>
        </div>
    );
}
