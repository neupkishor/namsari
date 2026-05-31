"use client";

import React, { useEffect, useMemo, useState } from 'react';
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
    "Koshi",
    "Madhesh",
    "Bagmati",
    "Gandaki",
    "Lumbini",
    "Karnali",
    "Sudurpashchim"
];

type LocationRow = {
    id: number;
    name: string;
    type: string;
    parentId: number | null;
};

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
    const [locationRows, setLocationRows] = useState<LocationRow[]>([]);
    const [locationLoadError, setLocationLoadError] = useState('');

    useEffect(() => {
        let mounted = true;

        const loadLocations = async () => {
            try {
                const response = await fetch('/api/locations');
                if (!response.ok) {
                    throw new Error('Unable to load locations');
                }
                const data = await response.json();
                if (mounted) {
                    setLocationRows(Array.isArray(data.locations) ? data.locations : []);
                    setLocationLoadError('');
                }
            } catch (error) {
                if (mounted) {
                    setLocationRows([]);
                    setLocationLoadError('Unable to load location suggestions.');
                }
            }
        };

        loadLocations();

        return () => {
            mounted = false;
        };
    }, []);

    const provinceList = useMemo(() => {
        const apiProvinces = locationRows.filter(item => item.type === 'province').map(item => item.name);
        return apiProvinces.length > 0 ? apiProvinces : PROVINCES;
    }, [locationRows]);

    const districtList = useMemo(() => {
        const apiDistricts = locationRows.filter(item => item.type === 'district').map(item => item.name);
        return apiDistricts.length > 0 ? apiDistricts : ALL_DISTRICTS;
    }, [locationRows]);

    const cityList = useMemo(() => {
        const apiCities = locationRows.filter(item => item.type === 'city').map(item => item.name);
        return apiCities;
    }, [locationRows]);

    const locationById = useMemo(() => {
        return new Map(locationRows.map(item => [item.id, item] as const));
    }, [locationRows]);

    const normalizedDistrictMap = useMemo(() => {
        const map = new Map<string, string>();
        districtList.forEach(districtName => {
            const match = locationRows.find(item => item.type === 'district' && item.name.toLowerCase() === districtName.toLowerCase());
            if (match?.parentId) {
                const parent = locationById.get(match.parentId);
                if (parent?.name) {
                    map.set(districtName.toLowerCase(), parent.name);
                }
            }
        });
        return map;
    }, [districtList, locationById, locationRows]);

    const normalizedCityMap = useMemo(() => {
        const map = new Map<string, { district: string; province: string }>();
        cityList.forEach(cityName => {
            const match = locationRows.find(item => item.type === 'city' && item.name.toLowerCase() === cityName.toLowerCase());
            const districtRow = match?.parentId ? locationById.get(match.parentId) : undefined;
            const provinceRow = districtRow?.parentId ? locationById.get(districtRow.parentId) : undefined;
            if (districtRow?.name && provinceRow?.name) {
                map.set(cityName.toLowerCase(), { district: districtRow.name, province: provinceRow.name });
            }
        });
        return map;
    }, [cityList, locationById, locationRows]);

    const filteredProvinces = province
        ? provinceList.filter(p => p.toLowerCase().includes(province.toLowerCase()))
        : provinceList;

    const filteredDistricts = district
        ? districtList.filter(d => d.toLowerCase().includes(district.toLowerCase()))
        : districtList;

    const filteredCities = cityVillage
        ? cityList.filter(city => city.toLowerCase().includes(cityVillage.toLowerCase()))
        : cityList;

    const chipStyle: React.CSSProperties = {
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
    };

    const clearProvince = () => {
        setProvince('');
        setDistrict('');
        setCityVillage('');
        setErrors(prev => ({ ...prev, province: '', district: '' }));
    };

    const clearDistrict = () => {
        setDistrict('');
        setCityVillage('');
        setErrors(prev => ({ ...prev, district: '' }));
    };

    const syncProvinceFromDistrict = (districtName: string) => {
        const nextProvince = normalizedDistrictMap.get(districtName.trim().toLowerCase());
        if (nextProvince) {
            setProvince(nextProvince);
        }
    };

    const syncProvinceAndDistrictFromCity = (cityName: string) => {
        const match = normalizedCityMap.get(cityName.trim().toLowerCase());
        if (match) {
            setProvince(match.province);
            setDistrict(match.district);
        }
    };

    if (!unlocked) return null;

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
                                setDistrict('');
                                setCityVillage('');
                                setErrors(prev => ({ ...prev, province: '' }));
                            }}
                            error={errors.province}
                        />
                        {filteredProvinces.length > 0 && (
                            <div
                                className="hide-scrollbar"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflowX: 'auto',
                                    gap: '8px',
                                    marginTop: '8px',
                                    paddingBottom: '4px',
                                    whiteSpace: 'nowrap',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {province && (
                                    <button
                                        type="button"
                                        onClick={clearProvince}
                                        style={{
                                            ...chipStyle,
                                            background: '#fff7ed',
                                            borderColor: '#fdba74',
                                            color: '#9a3412'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#ffedd5'; e.currentTarget.style.borderColor = '#fb923c'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fdba74'; }}
                                    >
                                        Clear
                                    </button>
                                )}
                                {filteredProvinces.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                            setProvince(p);
                                            setDistrict('');
                                            setCityVillage('');
                                            setErrors(prev => ({ ...prev, province: '' }));
                                        }}
                                        style={chipStyle}
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
                                const nextDistrict = e.target.value;
                                setDistrict(nextDistrict);
                                setErrors(prev => ({ ...prev, district: '' }));
                                if (nextDistrict.trim()) {
                                    syncProvinceFromDistrict(nextDistrict);
                                }
                            }}
                            error={errors.district}
                        />
                        {filteredDistricts.length > 0 && (
                            <div
                                className="hide-scrollbar"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflowX: 'auto',
                                    gap: '8px',
                                    marginTop: '8px',
                                    paddingBottom: '4px',
                                    whiteSpace: 'nowrap',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {district && (
                                    <button
                                        type="button"
                                        onClick={clearDistrict}
                                        style={{
                                            ...chipStyle,
                                            background: '#fff7ed',
                                            borderColor: '#fdba74',
                                            color: '#9a3412'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#ffedd5'; e.currentTarget.style.borderColor = '#fb923c'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fdba74'; }}
                                    >
                                        Clear
                                    </button>
                                )}
                                {filteredDistricts.map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => {
                                            setDistrict(d);
                                            syncProvinceFromDistrict(d);
                                            setErrors(prev => ({ ...prev, district: '' }));
                                        }}
                                        style={chipStyle}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Input
                            label="City/Village"
                            name="cityVillage"
                            placeholder="City/Village"
                            required
                            value={cityVillage}
                            onChange={(e) => {
                                const nextCity = e.target.value;
                                setCityVillage(nextCity);
                                setErrors(prev => ({ ...prev, cityVillage: '' }));
                                if (nextCity.trim()) {
                                    syncProvinceAndDistrictFromCity(nextCity);
                                }
                            }}
                            error={errors.cityVillage}
                        />
                        {filteredCities.length > 0 && (
                            <div
                                className="hide-scrollbar"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflowX: 'auto',
                                    gap: '8px',
                                    marginTop: '8px',
                                    paddingBottom: '4px',
                                    whiteSpace: 'nowrap',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {cityVillage && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCityVillage('');
                                            setErrors(prev => ({ ...prev, cityVillage: '' }));
                                        }}
                                        style={{
                                            ...chipStyle,
                                            background: '#fff7ed',
                                            borderColor: '#fdba74',
                                            color: '#9a3412'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#ffedd5'; e.currentTarget.style.borderColor = '#fb923c'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fdba74'; }}
                                    >
                                        Clear
                                    </button>
                                )}
                                {filteredCities.map(city => (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => {
                                            setCityVillage(city);
                                            syncProvinceAndDistrictFromCity(city);
                                            setErrors(prev => ({ ...prev, cityVillage: '' }));
                                        }}
                                        style={chipStyle}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
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

            {locationLoadError && (
                <div style={{ marginTop: '12px', color: '#b91c1c', fontSize: '0.9rem' }}>
                    {locationLoadError}
                </div>
            )}

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onComplete} style={{ padding: '16px 40px', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}>Continue to Nearby Location →</button>
            </div>
        </div>
    );
};
