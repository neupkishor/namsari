"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';
import { createListing } from './actions/listing';
import { BasicInformation } from './components/BasicInformation';
import { LocationInformation } from './components/LocationInformation';
import { PropertyInformation } from './components/PropertyInformation';

import { SiteHeader } from '@/components/SiteHeader';

export default function SellClient({ users, currentUserId, currentUser }: { users: any[], currentUserId: number, currentUser?: any }) {
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

    // State for toggling between Rent and Sale details
    // Form sections are now managed by unlockedSections state
    const [title, setTitle] = useState('');
    const [district, setDistrict] = useState('');
    const [cityVillage, setCityVillage] = useState('');
    const [area, setArea] = useState('');
    const [ward, setWard] = useState('');
    const [landmark, setLandmark] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isTitleEdited, setIsTitleEdited] = useState(false);
    const [nearbyLocations, setNearbyLocations] = useState<Array<{ id: string; name: string; distance: number }>>([]);

    // Property Details
    const [roadType, setRoadType] = useState('Blacktopped');
    const [facingDirection, setFacingDirection] = useState('East');
    const [furnishing, setFurnishing] = useState('Unfurnished');
    const [builtUpAreaUnit, setBuiltUpAreaUnit] = useState('sqft');
    const [ownerId, setOwnerId] = useState(currentUserId.toString());
    const [authorizedPersonId, setAuthorizedPersonId] = useState('');

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

    // Track which sections are unlocked/visible
    const [unlockedSections, setUnlockedSections] = useState<number[]>([1]);

    const validateSection = (section: number) => {
        const newErrors: Record<string, string> = {};

        if (section === 1) {
            if (selectedPurposes.length === 0) newErrors.purpose = "Please select a Purpose.";
            if (selectedTypes.length === 0) newErrors.type = "Please select at least one Property Type.";
            if (!title.trim()) newErrors.title = "Please enter a Property Title.";
        } else if (section === 2) {
            if (!district.trim()) newErrors.district = "District is required.";
            if (!cityVillage.trim()) newErrors.cityVillage = "City/Village is required.";
            if (!area.trim()) newErrors.area = "Area is required.";
        } else if (section === 3) {
            if (!price.trim()) newErrors.price = "Please enter a Price.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCompleteSection = (section: number) => {
        if (validateSection(section)) {
            // Unlock the next section if not already unlocked
            if (!unlockedSections.includes(section + 1) && section < 3) {
                setUnlockedSections(prev => [...prev, section + 1]);
            }
            // Scroll to next section smoothly
            setTimeout(() => {
                const nextSection = document.getElementById(`section-${section + 1}`);
                if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
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
            <SiteHeader user={currentUser} />

            <div className="layout-container" style={{ maxWidth: '900px', paddingTop: '60px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary-light)', marginBottom: '12px' }}>List New Property</h1>
                    <p style={{ fontSize: '1rem', color: '#64748b' }}>Fill out the form below to list your property. Complete each section to unlock the next.</p>
                </div>

                <form action={createListing} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    <BasicInformation
                        unlocked={unlockedSections.includes(1)}
                        onComplete={() => handleCompleteSection(1)}
                        selectedTypes={selectedTypes}
                        typeOptions={typeOptions}
                        isTypeDisabled={isTypeDisabled}
                        handleTypeChange={handleTypeChange}
                        selectedPurposes={selectedPurposes}
                        handlePurposeChange={handlePurposeChange}
                        selectedNatures={selectedNatures}
                        natureOptions={natureOptions}
                        handleNatureChange={handleNatureChange}
                        title={title}
                        setTitle={setTitle}
                        setIsTitleEdited={setIsTitleEdited}
                        errors={errors}
                        setErrors={setErrors}
                    />

                    <LocationInformation
                        unlocked={unlockedSections.includes(2)}
                        onComplete={() => handleCompleteSection(2)}
                        locationSource={locationSource}
                        handleLocationSourceChange={handleLocationSourceChange}
                        fetchCoordinates={fetchCoordinates}
                        fetchingCoords={fetchingCoords}
                        coords={coords}
                        setCoords={(c) => setCoords(c)}
                        setLocationSource={setLocationSource}
                        district={district}
                        setDistrict={setDistrict}
                        cityVillage={cityVillage}
                        setCityVillage={setCityVillage}
                        area={area}
                        setArea={setArea}
                        nearbyLocations={nearbyLocations}
                        setNearbyLocations={setNearbyLocations}
                        ward={ward}
                        setWard={setWard}
                        landmark={landmark}
                        setLandmark={setLandmark}
                        errors={errors}
                        setErrors={setErrors}
                    />

                    <PropertyInformation
                        unlocked={unlockedSections.includes(3)}
                        selectedTypes={selectedTypes}
                        pricingType={pricingType}
                        setPricingType={setPricingType}
                        pricingUnit={pricingUnit}
                        setPricingUnit={setPricingUnit}
                        price={price}
                        setPrice={setPrice}
                        priceNegotiable={priceNegotiable}
                        setPriceNegotiable={setPriceNegotiable}
                        rentPrice={rentPrice}
                        setRentPrice={setRentPrice}
                        getPriceInWords={getPriceInWords}
                        uploadedImages={uploadedImages}
                        uploading={uploading}
                        handleFileChange={handleFileChange}
                        removeImage={removeImage}
                        users={users}
                        currentUserId={currentUserId}
                        roadType={roadType}
                        setRoadType={setRoadType}
                        facingDirection={facingDirection}
                        setFacingDirection={setFacingDirection}
                        furnishing={furnishing}
                        setFurnishing={setFurnishing}
                        builtUpAreaUnit={builtUpAreaUnit}
                        setBuiltUpAreaUnit={setBuiltUpAreaUnit}
                        ownerId={ownerId}
                        setOwnerId={setOwnerId}
                        authorizedPersonId={authorizedPersonId}
                        setAuthorizedPersonId={setAuthorizedPersonId}
                        errors={errors}
                        setErrors={setErrors}
                    />
                </form>
            </div>
        </main>
    );
}
