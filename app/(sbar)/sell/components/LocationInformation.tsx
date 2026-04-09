"use client";

import React from 'react';
import { Input } from '@/components/ui';
import {
    FormGrid,
    FormLabel,
    GeoLocationInput,
    QuickCategorySelect,
    NearbyLocationCard
} from '@/components/form';

interface LocationInformationProps {
    unlocked: boolean;
    onComplete: () => void;
    // Location source & Coords
    locationSource: string;
    handleLocationSourceChange: (val: string) => void;
    fetchCoordinates: () => void;
    fetchingCoords: boolean;
    coords: { lat: string; lng: string };
    setCoords: (coords: { lat: string; lng: string }) => void;
    setLocationSource: (val: string) => void;
    // District, City, Area
    district: string;
    setDistrict: (val: string) => void;
    cityVillage: string;
    setCityVillage: (val: string) => void;
    area: string;
    setArea: (val: string) => void;
    // Ward & Landmark
    ward: string;
    setWard: (val: string) => void;
    landmark: string;
    setLandmark: (val: string) => void;
    // Nearby Locations
    nearbyLocations: Array<{ id: string; name: string; distance: number }>;
    setNearbyLocations: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; distance: number }>>>;
    // Errors
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const ALL_DISTRICTS = [
    "Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur",
    "Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha",
    "Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok",
    "Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur (East Nawalparasi)", "Parbat", "Syangja", "Tanahun",
    "Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Palpa", "Pyuthan", "Rolpa", "Rupandehi", "Eastern Rukum (Rukum East)", "Nawalparasi West (West of Bardaghat Susta)",
    "Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Salyan", "Surkhet", "Western Rukum (Rukum West)",
    "Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"
];

const PRESET_CATEGORIES = [
    { label: 'Hospital', icon: '🏥' },
    { label: 'Gym', icon: '💪' },
    { label: 'Park', icon: '🌳' },
    { label: 'Pokhara', icon: '🏔️' },
    { label: 'Woda Office', icon: '🏢' },
    { label: 'Public Transport', icon: '🚌' },
    { label: 'School', icon: '🏫' },
    { label: 'Pharmacy', icon: '💊' },
    { label: 'Banquete', icon: '🎉' },
    { label: 'Restaurant', icon: '🍽️' },
    { label: 'Hotel', icon: '�' },
    { label: 'Atm', icon: '🏧' },
    { label: 'Police Station', icon: '�' },
    { label: 'Temple', icon: '🛕' },
    { label: 'Market', icon: '🛍️' },
    { label: 'Bank', icon: '🏦' },
    { label: 'Airport', icon: '✈️' },
    { label: 'Bus Stop', icon: '🚏' },
];

export const LocationInformation: React.FC<LocationInformationProps> = ({
    unlocked,
    onComplete,
    locationSource,
    handleLocationSourceChange,
    fetchCoordinates,
    fetchingCoords,
    coords,
    setCoords,
    setLocationSource,
    district,
    setDistrict,
    cityVillage,
    setCityVillage,
    area,
    setArea,
    ward,
    setWard,
    landmark,
    setLandmark,
    nearbyLocations,
    setNearbyLocations,
    errors,
    setErrors
}) => {
    if (!unlocked) return null;

    const filteredDistricts = district
        ? ALL_DISTRICTS.filter(d => d.toLowerCase().includes(district.toLowerCase()))
        : ALL_DISTRICTS;

    const handleAddLocation = (label: string, icon?: string) => {
        const trimmedLabel = label.trim();
        if (!trimmedLabel) return;

        const normalizedLabel = trimmedLabel.toLowerCase();

        // Find if it matches a preset category to get the standard icon and label
        const preset = PRESET_CATEGORIES.find(c => c.label.toLowerCase() === normalizedLabel);

        const finalLabel = preset ? preset.label : trimmedLabel;
        const finalIcon = preset ? preset.icon : (icon || '📍');

        // Check for duplicates
        const isDuplicate = nearbyLocations.some(loc => {
            const parts = loc.name.split(' ');
            const existingLabel = parts.length > 1 ? parts.slice(1).join(' ') : loc.name;
            return existingLabel.toLowerCase() === finalLabel.toLowerCase();
        });

        if (isDuplicate) {
            return;
        }

        setNearbyLocations(prev => [...prev, {
            id: Math.random().toString(),
            name: `${finalIcon} ${finalLabel}`,
            distance: 500
        }]);
    };

    const availableCategories = PRESET_CATEGORIES.filter(cat => {
        return !nearbyLocations.some(loc => {
            const parts = loc.name.split(' ');
            const existingLabel = parts.length > 1 ? parts.slice(1).join(' ') : loc.name;
            return existingLabel.toLowerCase() === cat.label.toLowerCase();
        });
    });

    return (
        <div id="section-2" style={{ padding: '0 0 60px 0', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--color-primary-light)', marginBottom: '48px', borderBottom: '4px solid var(--color-primary)', paddingBottom: '20px', width: '100%' }}>
                2. Location Information
            </h2>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Address Information</FormLabel>

                <GeoLocationInput
                    value={locationSource}
                    onChange={handleLocationSourceChange}
                    onFetch={fetchCoordinates}
                    onClear={() => {
                        setCoords({ lat: '', lng: '' });
                        setLocationSource('');
                    }}
                    hasCoords={!!coords.lat}
                    isFetching={fetchingCoords}
                    latitude={coords.lat}
                    longitude={coords.lng}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FormGrid cols={2} gap="24px">
                        <Input label="Ward Number" name="ward" placeholder="e.g. 8" value={ward} onChange={(e) => setWard(e.target.value)} />
                        <Input label="Landmark" name="landmark" placeholder="e.g. Behind Big Mart" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                    </FormGrid>
                    <div style={{ position: 'relative' }}>
                        <Input
                            label="District"
                            name="district"
                            placeholder="Type to search district..."
                            required
                            value={district}
                            onChange={(e) => {
                                setDistrict(e.target.value);
                                setErrors(prev => ({ ...prev, district: '' }));
                            }}
                            error={errors.district}
                        />
                        {filteredDistricts.length > 0 && (
                            <div
                                className="hide-scrollbar"
                                style={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    gap: '8px',
                                    marginTop: '8px',
                                    paddingBottom: '4px',
                                    whiteSpace: 'nowrap',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {filteredDistricts.map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDistrict(d)}
                                        style={{
                                            padding: '6px 14px',
                                            background: '#f1f5f9',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            color: '#475569',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            flexShrink: 0
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Input label="City/Village" name="cityVillage" placeholder="City/Village" required value={cityVillage} onChange={(e) => { setCityVillage(e.target.value); setErrors(prev => ({ ...prev, cityVillage: '' })); }} error={errors.cityVillage} />
                    <Input label="Area" name="area" placeholder="Area" required value={area} onChange={(e) => { setArea(e.target.value); setErrors(prev => ({ ...prev, area: '' })); }} error={errors.area} />
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Nearby Locations</FormLabel>

                <FormGrid minWidth="280px" gap="16px">
                    {nearbyLocations.map((loc) => (
                        <NearbyLocationCard
                            key={loc.id}
                            id={loc.id}
                            name={loc.name}
                            distance={loc.distance}
                            onRemove={() => setNearbyLocations(prev => prev.filter(l => l.id !== loc.id))}
                            onDistanceChange={(newDistance) => setNearbyLocations(prev => prev.map(l => l.id === loc.id ? { ...l, distance: newDistance } : l))}
                        />
                    ))}
                </FormGrid>

                <div style={{ marginTop: '24px' }}>
                    <QuickCategorySelect
                        categories={availableCategories}
                        onSelect={(label, icon) => handleAddLocation(label, icon)}
                        onCustom={() => {
                            const name = prompt("Enter landmark name (e.g. Shopping Mall):");
                            if (name) handleAddLocation(name);
                        }}
                    />
                </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onComplete} style={{ padding: '16px 40px', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}>Continue to Property Information →</button>
            </div>
        </div>
    );
};
