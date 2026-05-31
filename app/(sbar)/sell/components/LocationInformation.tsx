"use client";

import React from 'react';
import { Input } from '@/components/ui';
import {
    FormGrid,
    FormLabel,
    GeoLocationInput
} from '@/components/form';

interface LocationInformationProps {
    unlocked: boolean;
    onComplete: () => void;
    province: string;
    setProvince: (val: string) => void;
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

const PROVINCES = [
    "Koshi Province",
    "Madhesh Province",
    "Bagmati Province",
    "Gandaki Province",
    "Lumbini Province",
    "Karnali Province",
    "Sudurpashchim Province"
];

export const LocationInformation: React.FC<LocationInformationProps> = ({
    unlocked,
    onComplete,
    province,
    setProvince,
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
    errors,
    setErrors
}) => {
    if (!unlocked) return null;

    const filteredProvinces = province
        ? PROVINCES.filter(p => p.toLowerCase().includes(province.toLowerCase()))
        : PROVINCES;

    const filteredDistricts = district
        ? ALL_DISTRICTS.filter(d => d.toLowerCase().includes(district.toLowerCase()))
        : ALL_DISTRICTS;

    return (
        <div id="section-2" style={{ padding: '0 0 60px 0', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--color-primary-light)', marginBottom: '48px', borderBottom: '4px solid var(--color-primary)', paddingBottom: '20px', width: '100%' }}>
                2. Location Information
            </h2>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Address Information</FormLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <Input
                            label="Province"
                            name="province"
                            placeholder="Type to search province..."
                            required
                            value={province}
                            onChange={(e) => {
                                setProvince(e.target.value);
                                setErrors(prev => ({ ...prev, province: '' }));
                            }}
                            error={errors.province}
                        />
                        {filteredProvinces.length > 0 && (
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
                                {filteredProvinces.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setProvince(p)}
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
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
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
                    <Input label="Ward Number" name="ward" placeholder="e.g. 8" value={ward} onChange={(e) => setWard(e.target.value)} />
                    <Input label="Landmark" name="landmark" placeholder="e.g. Behind Big Mart" value={landmark} onChange={(e) => setLandmark(e.target.value)} />

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
                </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onComplete} style={{ padding: '16px 40px', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}>Continue to Nearby Location →</button>
            </div>
        </div>
    );
};
