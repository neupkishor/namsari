"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createListing } from './actions/listing';
import imageCompression from 'browser-image-compression';
import { Input, TextArea, Select, Checkbox } from '@/components/ui';

interface UserOption {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface SellClientProps {
    users: UserOption[];
    currentUserId: number;
}

export default function SellClient({ users, currentUserId }: SellClientProps) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
    const [selectedNatures, setSelectedNatures] = useState<string[]>([]);

    const [pricingType, setPricingType] = useState('flat');
    const [pricingUnit, setPricingUnit] = useState('aana');

    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; type: string }>>([]);

    const [price, setPrice] = useState('');
    const [priceNegotiable, setPriceNegotiable] = useState('');
    const [rentPrice, setRentPrice] = useState('');

    const [coords, setCoords] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });
    const [fetchingCoords, setFetchingCoords] = useState(false);
    const [locationSource, setLocationSource] = useState('');

    const [activeSection, setActiveSection] = useState(1);
    const [title, setTitle] = useState('');
    const [district, setDistrict] = useState('');
    const [cityVillage, setCityVillage] = useState('');
    const [area, setArea] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isTitleEdited, setIsTitleEdited] = useState(false);
    const [nearbyLocations, setNearbyLocations] = useState<Array<{ id: string; name: string; distance: number }>>([]);

    useEffect(() => {
        if (isTitleEdited) return;

        const formatLabel = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        const joinWithAnd = (items: string[]) => {
            if (items.length === 0) return '';
            if (items.length === 1) return items[0];
            const allButLast = items.slice(0, -1).join(', ');
            return `${allButLast} & ${items[items.length - 1]}`;
        };

        const natures = joinWithAnd(selectedNatures.map(formatLabel));
        const types = joinWithAnd(selectedTypes.map(formatLabel));
        const purposes = joinWithAnd(selectedPurposes.map(p => p === 'sale' ? 'Sale' : 'Rent'));

        let autoTitle = '';
        if (natures) autoTitle += natures + ' ';
        if (types) autoTitle += types;
        if (purposes) autoTitle += ` for ${purposes}`;
        if (autoTitle) autoTitle += ' in ';

        setTitle(autoTitle);
    }, [selectedNatures, selectedTypes, selectedPurposes, isTitleEdited]);

    const amenitiyOptions = [
        'hospital', 'gym', 'park', 'pokhara', 'woda office', 'public transport',
        'school', 'pharmacy', 'banquete', 'restaurant', 'hotel', 'atm', 'police station'
    ];

    const distanceSuggestions = [
        'swyambhunath', 'pashupatinath', 'fewataal', '0km', 'ringroad', 'bouddha', 'bhatbhateni'
    ];

    const typeOptions = [
        { label: 'House', value: 'house', group: 'residential' },
        { label: 'Bungalow', value: 'bungalow', group: 'residential' },
        { label: 'Villa', value: 'villa', group: 'residential' },
        { label: 'Multiplex', value: 'multiplex', group: 'residential' },
        { label: 'Land', value: 'land', group: 'land' },
        { label: 'Apartment', value: 'apartment', group: 'apartment' },
        { label: 'Penthouse', value: 'penthouse', group: 'apartment' },
        { label: 'Commercial Space', value: 'commercial space', group: 'commercial' },
    ];

    const natureOptions = [
        { label: 'Commercial', value: 'commercial' },
        { label: 'Semi Commercial', value: 'semi commercial' },
        { label: 'Residential', value: 'residential' },
        { label: 'Agricultural', value: 'agricultural' },
        { label: 'Industrial', value: 'industrial' },
    ];

    const isTypeDisabled = (val: string) => {
        if (selectedTypes.length === 0) return false;
        if (selectedTypes.includes(val)) return false;

        const isHouseOrLand = (t: string) => ['house', 'bungalow', 'villa', 'multiplex', 'land'].includes(t);
        const isApartment = (t: string) => ['apartment', 'penthouse'].includes(t);
        const isCommercial = (t: string) => t === 'commercial space';

        const hasSelectedHouseOrLand = selectedTypes.some(isHouseOrLand);
        const hasSelectedApartment = selectedTypes.some(isApartment);
        const hasSelectedCommercial = selectedTypes.some(isCommercial);

        if (isHouseOrLand(val)) return hasSelectedApartment || hasSelectedCommercial;
        if (isApartment(val)) return hasSelectedHouseOrLand || hasSelectedCommercial;
        if (isCommercial(val)) return hasSelectedHouseOrLand || hasSelectedApartment;

        return false;
    };

    const handleTypeChange = (val: string) => {
        if (isTypeDisabled(val)) return;
        setSelectedTypes(prev => {
            if (prev.includes(val)) {
                return prev.filter(v => v !== val);
            }
            return [...prev, val];
        });
    };


    const handlePurposeChange = (val: string) => {
        setSelectedPurposes(prev =>
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );
    };

    const handleNatureChange = (val: string) => {
        setSelectedNatures(prev =>
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );
    };

    const validateSection = () => {
        const newErrors: Record<string, string> = {};

        if (activeSection === 1) {
            if (selectedPurposes.length === 0) newErrors.purpose = "Please select a Purpose.";
            if (selectedTypes.length === 0) newErrors.type = "Please select at least one Property Type.";
            if (!title.trim()) newErrors.title = "Please enter a Property Title.";
            if (!district.trim()) newErrors.district = "District is required.";
            if (!cityVillage.trim()) newErrors.cityVillage = "City/Village is required.";
            if (!area.trim()) newErrors.area = "Area is required.";
        } else if (activeSection === 3) {
            if (!price.trim()) newErrors.price = "Please enter a Price.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateSection()) {
            setActiveSection(prev => prev + 1);
        }
    };

    const handleLocationSourceChange = (val: string) => {
        setLocationSource(val);
        const urlMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (urlMatch) {
            setCoords({ lat: urlMatch[1], lng: urlMatch[2] });
            return;
        }
        const geoMatch = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
        if (geoMatch) {
            setCoords({ lat: geoMatch[1], lng: geoMatch[2] });
        }
    };

    const fetchCoordinates = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setFetchingCoords(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toString();
                const lng = position.coords.longitude.toString();
                setCoords({ lat, lng });
                setLocationSource(`${lat}, ${lng}`);
                setFetchingCoords(false);
            },
            (error) => {
                console.error("Error fetching coordinates:", error);
                alert("Unable to retrieve your location");
                setFetchingCoords(false);
            }
        );
    };

    const getPriceInWords = (priceStr: string) => {
        const num = parseInt(priceStr.replace(/,/g, ''), 10);
        if (isNaN(num) || num === 0) return '';
        const units = [
            { value: 10000000, label: 'Crore' },
            { value: 100000, label: 'Lakh' },
            { value: 1000, label: 'Thousand' },
            { value: 100, label: 'Hundred' }
        ];
        let result = '';
        let remaining = num;
        for (const unit of units) {
            if (remaining >= unit.value) {
                const count = Math.floor(remaining / unit.value);
                result += `${count} ${unit.label} `;
                remaining %= unit.value;
            }
        }
        return result.trim().toLowerCase();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imageType: string) => {
        if (!e.target.files?.[0]) return;
        const originalFile = e.target.files[0];
        setCompressing(true);
        try {
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedBlob = await imageCompression(originalFile, options);
            const file = new File([compressedBlob], originalFile.name, { type: compressedBlob.type });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('platform', 'namsari');

            setUploading(true);
            const res = await fetch('https://cdn.neupgroup.com/bridge/api/v1/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setUploadedImages(prev => [...prev, { url: data.url, type: imageType }]);
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCompressing(false);
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <header className="full-width-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <div className="layout-container header-content">
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                        Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                    </Link>
                    <nav style={{ display: 'flex', gap: '32px', fontWeight: '500', fontSize: '0.9rem', alignItems: 'center' }}>
                        <Link href="/">Browse</Link>
                        <Link href="/manage" style={{ background: 'var(--color-primary)', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>
                            Management
                        </Link>
                    </nav>
                </div>
            </header>

            <div className="layout-container" style={{ maxWidth: '900px', paddingTop: '60px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>List New Property</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4].map(step => (
                            <div
                                key={step}
                                onClick={() => setActiveSection(step)}
                                style={{
                                    height: '4px',
                                    flex: 1,
                                    background: activeSection >= step ? 'var(--color-primary)' : '#e2e8f0',
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    transition: 'background 0.3s'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <form action={createListing} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '0' }}>

                    {/* SECTION 1: GENERAL BASICS */}
                    <div style={{ display: activeSection === 1 ? 'flex' : 'none', flexDirection: 'column', gap: '24px' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>Purpose</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                                {['sale', 'rent'].map(opt => (
                                    <div
                                        key={opt}
                                        onClick={() => {
                                            handlePurposeChange(opt);
                                            setErrors(prev => ({ ...prev, purpose: '' }));
                                        }}
                                        style={{
                                            padding: '12px',
                                            border: '1px solid',
                                            borderColor: selectedPurposes.includes(opt) ? 'var(--color-primary)' : (errors.purpose ? '#ef4444' : '#e2e8f0'),
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: selectedPurposes.includes(opt) ? '#f0f9ff' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            name="propertyPurpose"
                                            value={opt}
                                            checked={selectedPurposes.includes(opt)}
                                            readOnly
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{opt === 'sale' ? 'For Sale' : 'For Rent'}</span>
                                    </div>
                                ))}
                            </div>
                            {errors.purpose && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '500' }}>{errors.purpose}</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>Property Nature</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                                {natureOptions.map(opt => (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleNatureChange(opt.value)}
                                        style={{
                                            padding: '12px',
                                            border: '1px solid',
                                            borderColor: selectedNatures.includes(opt.value) ? 'var(--color-primary)' : '#e2e8f0',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: selectedNatures.includes(opt.value) ? '#f0f9ff' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            name="propertyNature"
                                            value={opt.value}
                                            checked={selectedNatures.includes(opt.value)}
                                            readOnly
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{opt.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>Property Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                                {typeOptions.map(opt => {
                                    const disabled = isTypeDisabled(opt.value);
                                    return (
                                        <div
                                            key={opt.value}
                                            onClick={() => {
                                                if (!disabled) {
                                                    handleTypeChange(opt.value);
                                                    setErrors(prev => ({ ...prev, type: '' }));
                                                }
                                            }}
                                            style={{
                                                padding: '12px',
                                                border: '1px solid',
                                                borderColor: selectedTypes.includes(opt.value) ? 'var(--color-primary)' : (errors.type ? '#ef4444' : '#e2e8f0'),
                                                borderRadius: '8px',
                                                cursor: disabled ? 'not-allowed' : 'pointer',
                                                background: selectedTypes.includes(opt.value) ? '#f0f9ff' : 'white',
                                                opacity: disabled ? 0.4 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name="propertyType"
                                                value={opt.value}
                                                checked={selectedTypes.includes(opt.value)}
                                                readOnly
                                                disabled={disabled}
                                                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                                            />
                                            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{opt.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.type && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '500' }}>{errors.type}</span>}
                        </div>

                        <Input
                            label="Property Title"
                            name="title"
                            placeholder="e.g. Modern Villa in Bhaisepati"
                            required
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setErrors(prev => ({ ...prev, title: '' }));
                                if (e.target.value.length > 0) {
                                    setIsTitleEdited(true);
                                }
                            }}
                            error={errors.title}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>Address Information</label>

                            <div style={{ position: 'relative' }}>
                                <Input
                                    label="Geo Location"
                                    type="text"
                                    value={locationSource}
                                    onChange={(e) => handleLocationSourceChange(e.target.value)}
                                    placeholder="Pass Google Maps URL or location coordinates"
                                    disabled={!!coords.lat}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (coords.lat) {
                                            setCoords({ lat: '', lng: '' });
                                            setLocationSource('');
                                        } else {
                                            fetchCoordinates();
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '38px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                        color: coords.lat ? '#ef4444' : 'var(--color-primary)',
                                        zIndex: 10
                                    }}
                                >
                                    {fetchingCoords ? '...' : (coords.lat ? '✕' : '📍')}
                                </button>
                                {coords.lat && (
                                    <>
                                        <input type="hidden" name="latitude" value={coords.lat} />
                                        <input type="hidden" name="longitude" value={coords.lng} />
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                                <Input label="District" name="district" placeholder="District" required value={district} onChange={(e) => { setDistrict(e.target.value); setErrors(prev => ({ ...prev, district: '' })); }} error={errors.district} />
                                <Input label="City/Village" name="cityVillage" placeholder="City/Village" required value={cityVillage} onChange={(e) => { setCityVillage(e.target.value); setErrors(prev => ({ ...prev, cityVillage: '' })); }} error={errors.cityVillage} />
                                <Input label="Area" name="area" placeholder="Area" required value={area} onChange={(e) => { setArea(e.target.value); setErrors(prev => ({ ...prev, area: '' })); }} error={errors.area} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>Nearby Locations</label>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                                {nearbyLocations.map((loc) => (
                                    <div key={loc.id} style={{ padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Location {nearbyLocations.indexOf(loc) + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => setNearbyLocations(prev => prev.filter(l => l.id !== loc.id))}
                                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
                                            >✕</button>
                                        </div>
                                        <input
                                            placeholder="Name (e.g. School)"
                                            value={loc.name}
                                            onChange={(e) => {
                                                const newName = e.target.value;
                                                setNearbyLocations(prev => prev.map(l => l.id === loc.id ? { ...l, name: newName } : l));
                                            }}
                                            style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.85rem' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Distance: {loc.distance >= 1000 ? `${(loc.distance / 1000).toFixed(1)}km` : `${loc.distance}m`}</span>
                                            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                                                <button type="button" onClick={() => setNearbyLocations(prev => prev.map(l => l.id === loc.id ? { ...l, distance: Math.max(0, l.distance - 100) } : l))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>-</button>
                                                <button type="button" onClick={() => setNearbyLocations(prev => prev.map(l => l.id === loc.id ? { ...l, distance: l.distance + 100 } : l))} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>+</button>
                                            </div>
                                        </div>
                                        <input type="hidden" name="distanceFrom" value={`${loc.name} (${loc.distance >= 1000 ? `${(loc.distance / 1000).toFixed(1)}km` : `${loc.distance}m`})`} />
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => setNearbyLocations(prev => [...prev, { id: Math.random().toString(), name: '', distance: 500 }])}
                                    style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                                >+ Add Location</button>

                                {['100m', '500m', '1km', '2km', '5km'].map(preset => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => {
                                            const dist = preset.endsWith('km') ? parseInt(preset) * 1000 : parseInt(preset);
                                            setNearbyLocations(prev => [...prev, { id: Math.random().toString(), name: '', distance: dist }]);
                                        }}
                                        style={{ padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                    >+{preset}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>Visibility & Privacy</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                <div
                                    style={{
                                        padding: '16px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: 'white',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        const cb = document.getElementById('isPrivate-cb') as HTMLInputElement;
                                        if (cb) cb.click();
                                    }}
                                >
                                    <input type="checkbox" name="isPrivate" id="isPrivate-cb" style={{ marginTop: '4px', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mark as Private</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>Don't add exact images to your private listing if you want to hide details.</span>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        padding: '16px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: 'white',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        const cb = document.getElementById('dontShow-cb') as HTMLInputElement;
                                        if (cb) cb.click();
                                    }}
                                >
                                    <input type="checkbox" name="dontShowOnWebsite" id="dontShow-cb" style={{ marginTop: '4px', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Don't show on website</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>Will be private only for your management.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: PROPERTY FEATURES */}
                    <div style={{ display: activeSection === 2 ? 'flex' : 'none', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <Input label="Ward Number" name="ward" placeholder="e.g. 8" />
                            <Input label="Landmark" name="landmark" placeholder="e.g. Behind Big Mart" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                            <Select label="Road Type" name="roadType" options={[
                                { label: 'Blacktopped', value: 'Blacktopped' },
                                { label: 'Gravel', value: 'Gravel' },
                                { label: 'Soil', value: 'Soil' },
                                { label: 'Paved', value: 'Paved' }
                            ]} />
                            <Input label="Road Size" name="roadSize" placeholder="e.g. 13 ft" />
                            <Select label="Facing Direction" name="facingDirection" options={[
                                { label: 'East', value: 'East' }, { label: 'West', value: 'West' },
                                { label: 'North', value: 'North' }, { label: 'South', value: 'South' },
                                { label: 'North-East', value: 'North-East' }, { label: 'North-West', value: 'North-West' },
                                { label: 'South-East', value: 'South-East' }, { label: 'South-West', value: 'South-West' },
                            ]} />
                        </div>

                        {(selectedTypes.includes('house') || selectedTypes.includes('apartment') || selectedTypes.includes('villa')) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', padding: '24px', background: '#f1f5f9', borderRadius: '12px' }}>
                                <Input label="Bedrooms" name="bedrooms" type="number" />
                                <Input label="Bathrooms" name="bathrooms" type="number" />
                                <Input label="Kitchens" name="kitchens" type="number" />
                                <Input label="Living Rooms" name="livingRooms" type="number" />
                                <Input label="Floor No." name="floorNumber" type="number" />
                                <Input label="Total Floors" name="totalFloors" type="number" />
                                <Select label="Furnishing" name="furnishing" options={[
                                    { label: 'Unfurnished', value: 'Unfurnished' },
                                    { label: 'Semi-furnished', value: 'Semi-furnished' },
                                    { label: 'Full-furnished', value: 'Full-furnished' },
                                ]} />
                                <Input label="Built-up Area" name="builtUpArea" type="number" />
                                <Select label="Area Unit" name="builtUpAreaUnit" options={[
                                    { label: 'Sq. Ft.', value: 'sqft' },
                                    { label: 'Sq. M.', value: 'sqm' },
                                    { label: 'Aana', value: 'aana' },
                                    { label: 'Ropani', value: 'ropani' },
                                ]} />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                            <Checkbox label="Parking" name="parkingAvailable" />
                            <Checkbox label="Elevator" name="elevator" />
                            <Checkbox label="Security" name="security" />
                            <Checkbox label="Water" name="waterSupply" />
                            <Checkbox label="Electricity" name="electricity" />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px', fontSize: '0.9rem' }}>Nearby Amenities</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                                {amenitiyOptions.map(opt => (
                                    <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                        <input type="checkbox" name="amenities" value={opt} id={`amen-${opt}`} />
                                        <label htmlFor={`amen-${opt}`} style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{opt}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: PRICING */}
                    <div style={{ display: activeSection === 3 ? 'flex' : 'none', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <Select
                                label="Pricing Type"
                                name="pricingType"
                                value={pricingType}
                                onChange={(e) => setPricingType(e.target.value)}
                                options={[{ label: 'Flat Price', value: 'flat' }, { label: 'Per Unit', value: 'perUnit' }]}
                            />
                            {pricingType === 'perUnit' && (
                                <Select
                                    label="Unit"
                                    name="unit"
                                    value={pricingUnit}
                                    onChange={(e) => setPricingUnit(e.target.value)}
                                    options={[{ label: 'Meter Sq.', value: 'meterSquare' }, { label: 'Aana', value: 'aana' }, { label: 'Ropani', value: 'ropani' }]}
                                />
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <Input label="Price (NPR)" name="price" value={price} onChange={(e) => { setPrice(e.target.value); setErrors(prev => ({ ...prev, price: '' })); }} required error={errors.price} />
                                {price && <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '4px', textTransform: 'capitalize' }}>{getPriceInWords(price)}</div>}
                            </div>
                            <div>
                                <Input label="Negotiable Price (Optional)" name="priceNegotiable" value={priceNegotiable} onChange={(e) => setPriceNegotiable(e.target.value)} />
                                {priceNegotiable && <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '4px', textTransform: 'capitalize' }}>{getPriceInWords(priceNegotiable)}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <Input label="Rent Price (if applicable)" name="rentPrice" value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} />
                            </div>
                            <div style={{ paddingTop: '32px' }}>
                                <Checkbox label="Price is Negotiable" name="negotiable" defaultChecked />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: MEDIA & OWNERSHIP */}
                    <div style={{ display: activeSection === 4 ? 'flex' : 'none', flexDirection: 'column', gap: '24px' }}>

                        <div style={{ padding: '24px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', color: '#92400e' }}>Open House</h3>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                <Checkbox label="Mark as Open House" name="markOpenHouse" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <Input label="Date" name="openHouse_date" type="date" />
                                <Input label="Start Time" name="openHouse_start" type="time" />
                                <Input label="End Time" name="openHouse_end" type="time" />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px', fontSize: '0.9rem' }}>Property Media</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                {['livingroom', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'other'].map(room => (
                                    <div key={room} style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', background: '#f8fafc' }}>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, room)} id={`file-${room}`} style={{ display: 'none' }} />
                                        <label htmlFor={`file-${room}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '1.1rem' }}>📷</span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'capitalize' }}>{room}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {uploadedImages.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={img.url} alt="upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'red', border: 'none', color: 'white', borderRadius: '50%', width: '18px', height: '18px' }}>×</button>
                                        <input type="hidden" name="image_url" value={img.url} />
                                        <input type="hidden" name="image_of" value={img.type} />
                                    </div>
                                ))}
                                {uploading && <div style={{ width: '100px', height: '100px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>Uploding...</div>}
                            </div>
                        </div>

                        <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', color: '#0369a1' }}>Ownership & Authorization</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <Select
                                    label="Property Owner"
                                    name="ownerId"
                                    defaultValue={currentUserId.toString()}
                                    options={users.map(u => ({ label: `${u.name} (${u.phone})`, value: u.id.toString() }))}
                                />
                                <Select
                                    label="Authorized Person (Optional)"
                                    name="authorizedPersonId"
                                    placeholder="Select person"
                                    options={users.map(u => ({ label: `${u.name} (${u.phone})`, value: u.id.toString() }))}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                            <button type="button" onClick={() => setActiveSection(3)} style={{ flex: 1, padding: '16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Previous</button>
                            <button type="submit" style={{ flex: 2, padding: '16px', background: 'var(--color-primary)', color: 'white', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>Publish Listing</button>
                        </div>
                    </div>

                    {activeSection < 4 && (
                        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                            {activeSection > 1 && (
                                <button type="button" onClick={() => setActiveSection(activeSection - 1)} style={{ flex: 1, padding: '16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Back</button>
                            )}
                            <button type="button" onClick={handleNext} style={{ flex: 2, padding: '16px', background: 'var(--color-primary)', color: 'white', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                Next Step
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </main >
    );
}
