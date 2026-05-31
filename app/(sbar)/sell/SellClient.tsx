"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';
import { createListing } from './actions/listing';
import { discardPropertyDraft, savePropertyDraft } from './actions/drafts';
import { BasicInformation } from './components/BasicInformation';
import { LocationInformation } from './components/LocationInformation';
import { NearbyLocationInformation } from './components/NearbyLocationInformation';
import { PropertyInformation } from './components/PropertyInformation';
import { PropertyDraftChanges, normalizePropertyDraftChanges } from './draft-utils';

import { Header } from '@/components/menu/Header';
import { resolveUploadedFileUrl, uploadFileWithIntent } from '@/lib/uploader';
import { logUploadError } from '@/lib/client-error-logger';
import { getConfiguredDefaultUnit, mergeDraftDefaults } from '@/lib/agency-config';

type UploadProgress = {
    fileName: string;
    previewUrl: string;
    progress: number;
    status: 'compressing' | 'preparing' | 'uploading';
} | null;

export default function SellClient({ currentUser, initialPurpose, initialDraft, agencyConfig }: { currentUser?: any, initialPurpose?: string, initialDraft?: any, agencyConfig?: any }) {
    const draftValues = mergeDraftDefaults(normalizePropertyDraftChanges(initialDraft?.changes, initialPurpose), agencyConfig);

    const [selectedTypes, setSelectedTypes] = useState<string[]>(draftValues.selectedTypes || []);
    const [selectedPurposes, setSelectedPurposes] = useState<string[]>(draftValues.selectedPurposes || []);
    const [selectedNatures, setSelectedNatures] = useState<string[]>(draftValues.selectedNatures || []);

    const [pricingType, setPricingType] = useState(String(draftValues.pricingType || 'flat'));
    const [pricingUnit, setPricingUnit] = useState(String(draftValues.pricingUnit || 'aana'));

    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>(null);
    const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; type: string }>>(Array.isArray(draftValues.uploadedImages) ? draftValues.uploadedImages : []);

    const [price, setPrice] = useState(String(draftValues.price || ''));
    const [priceNegotiable, setPriceNegotiable] = useState(String(draftValues.priceNegotiable || ''));
    const [rentPrice, setRentPrice] = useState(String(draftValues.rentPrice || ''));

    const [coords, setCoords] = useState<{ lat: string; lng: string }>({
        lat: String(draftValues.coords?.lat || ''),
        lng: String(draftValues.coords?.lng || ''),
    });
    const [fetchingCoords, setFetchingCoords] = useState(false);
    const [locationSource, setLocationSource] = useState(String(draftValues.locationSource || ''));

    // State for toggling between Rent and Sale details
    // Form sections are now managed by unlockedSections state
    const [title, setTitle] = useState(String(draftValues.title || ''));
    const [province, setProvince] = useState(String(draftValues.province || ''));
    const [district, setDistrict] = useState(String(draftValues.district || ''));
    const [cityVillage, setCityVillage] = useState(String(draftValues.cityVillage || ''));
    const [area, setArea] = useState(String(draftValues.area || ''));
    const [ward, setWard] = useState(String(draftValues.ward || ''));
    const [landmark, setLandmark] = useState(String(draftValues.landmark || ''));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isTitleEdited, setIsTitleEdited] = useState(Boolean(draftValues.isTitleEdited));
    const [nearbyLocations, setNearbyLocations] = useState<Array<{ id: string; name: string; distance: number }>>(Array.isArray(draftValues.nearbyLocations) ? draftValues.nearbyLocations : []);

    // Property Details
    const [roadType, setRoadType] = useState(String(draftValues.roadType || 'Blacktopped'));
    const [roadSize, setRoadSize] = useState(String(draftValues.roadSize || ''));
    const roadSizeUnit = getConfiguredDefaultUnit(agencyConfig, 'roadSize') || 'ft';
    const [facingDirection, setFacingDirection] = useState(String(draftValues.facingDirection || 'East'));
    const [furnishing, setFurnishing] = useState(String(draftValues.furnishing || 'Unfurnished'));
    const [builtUpAreaUnit, setBuiltUpAreaUnit] = useState(String(draftValues.builtUpAreaUnit || 'sqft'));
    const [bedrooms, setBedrooms] = useState(String(draftValues.bedrooms || ''));
    const [bathrooms, setBathrooms] = useState(String(draftValues.bathrooms || ''));
    const [kitchens, setKitchens] = useState(String(draftValues.kitchens || ''));
    const [livingRooms, setLivingRooms] = useState(String(draftValues.livingRooms || ''));
    const [floorNumber, setFloorNumber] = useState(String(draftValues.floorNumber || ''));
    const [totalFloors, setTotalFloors] = useState(String(draftValues.totalFloors || ''));
    const [builtUpArea, setBuiltUpArea] = useState(String(draftValues.builtUpArea || ''));
    const [parkingAvailable, setParkingAvailable] = useState(Boolean(draftValues.parkingAvailable));
    const [elevator, setElevator] = useState(Boolean(draftValues.elevator));
    const [security, setSecurity] = useState(Boolean(draftValues.security));
    const [waterSupply, setWaterSupply] = useState(Boolean(draftValues.waterSupply));
    const [electricity, setElectricity] = useState(Boolean(draftValues.electricity));
    const [unlockedSections, setUnlockedSections] = useState<number[]>(Array.isArray(draftValues.unlockedSections) ? draftValues.unlockedSections : [1]);
    const [draftId, setDraftId] = useState<number | null>(initialDraft?.id ?? null);
    const [draftStatus, setDraftStatus] = useState<'draft' | 'published' | 'discarded'>(initialDraft?.status || 'draft');
    const [showDraftBanner, setShowDraftBanner] = useState(Boolean(initialDraft));
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialDraft?.updated_at ? new Date(initialDraft.updated_at).toLocaleString() : null);
    const autosaveTimerRef = useRef<number | null>(null);
    const didHydrateDraftRef = useRef(false);

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

    useEffect(() => {
        if (!draftId) return;

        if (!didHydrateDraftRef.current) {
            didHydrateDraftRef.current = true;
            return;
        }

        if (draftStatus === 'published') return;

        if (autosaveTimerRef.current) {
            window.clearTimeout(autosaveTimerRef.current);
        }

        autosaveTimerRef.current = window.setTimeout(async () => {
            try {
                const snapshot = buildDraftSnapshot();

                const response = await savePropertyDraft(draftId, snapshot, initialDraft?.doing || 'creation');
                setDraftStatus('draft');
                setLastSavedAt(new Date(response.updated_at).toLocaleString());
            } catch (error) {
                console.error('Failed to save property draft:', error);
            }
        }, 700);

        return () => {
            if (autosaveTimerRef.current) {
                window.clearTimeout(autosaveTimerRef.current);
            }
        };
    }, [
        draftId,
        draftStatus,
        selectedTypes,
        selectedPurposes,
        selectedNatures,
        pricingType,
        pricingUnit,
        uploadedImages,
        price,
        priceNegotiable,
        rentPrice,
        coords,
        locationSource,
        title,
        province,
        district,
        cityVillage,
        area,
        ward,
        landmark,
        nearbyLocations,
        roadType,
        roadSize,
        facingDirection,
        furnishing,
        builtUpAreaUnit,
        bedrooms,
        bathrooms,
        kitchens,
        livingRooms,
        floorNumber,
        totalFloors,
        builtUpArea,
        parkingAvailable,
        elevator,
        security,
        waterSupply,
        electricity,
        unlockedSections,
        isTitleEdited,
        initialDraft,
    ]);

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
        } else if (section === 2) {
            if (!province.trim()) newErrors.province = "Province is required.";
            if (!district.trim()) newErrors.district = "District is required.";
            if (!cityVillage.trim()) newErrors.cityVillage = "City/Village is required.";
        } else if (section === 4) {
            if (!price.trim()) newErrors.price = "Please enter a Price.";
            if (!title.trim()) newErrors.title = "Please enter a Property Title.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCompleteSection = (section: number) => {
        if (validateSection(section)) {
            // Unlock the next section if not already unlocked
            if (!unlockedSections.includes(section + 1) && section < 4) {
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
        const previewUrl = URL.createObjectURL(originalFile);

        setUploadProgress({
            fileName: originalFile.name,
            previewUrl,
            progress: 0,
            status: 'compressing'
        });
        setCompressing(true);
        try {
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedBlob = await imageCompression(originalFile, options);
            const file = new File([compressedBlob], originalFile.name, { type: compressedBlob.type });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('platform', 'namsari');

            setUploading(true);
            setUploadProgress(prev => prev ? { ...prev, progress: 0, status: 'uploading' } : prev);

            const data = await uploadFileWithIntent({
                type: 'properties',
                file,
                originalFile,
                formData,
                onStatusChange: (status) => {
                    setUploadProgress(prev => prev ? { ...prev, status, progress: status === 'preparing' ? 0 : prev.progress } : prev);
                },
                onProgress: (progress) => {
                    setUploadProgress(prev => prev ? { ...prev, progress, status: 'uploading' } : prev);
                }
            });

            if (data.success) {
                const fileUrl = resolveUploadedFileUrl(data.path || data.file, data.url);
                setUploadedImages(prev => [...prev, { url: fileUrl, type: imageType }]);
            } else {
                logUploadError(new Error(data.message || 'Upload failed'), {
                    imageType,
                    fileName: originalFile.name,
                    uploadType: 'properties',
                    response: data
                });
                alert('Upload failed: ' + (data.message || 'unknown'));
            }
        } catch (err) {
            console.error(err);
            logUploadError(err, {
                imageType,
                fileName: originalFile.name,
                uploadType: 'properties'
            });
            alert(err instanceof Error ? err.message : 'Failed to upload image');
        } finally {
            URL.revokeObjectURL(previewUrl);
            e.target.value = '';
            setCompressing(false);
            setUploading(false);
            setUploadProgress(null);
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const buildDraftSnapshot = (): PropertyDraftChanges => ({
        selectedTypes,
        selectedPurposes,
        selectedNatures,
        pricingType,
        pricingUnit,
        uploadedImages,
        price,
        priceNegotiable,
        rentPrice,
        coords,
        locationSource,
        title,
        province,
        district,
        cityVillage,
        area,
        ward,
        landmark,
        nearbyLocations,
        roadType,
        roadSize,
        facingDirection,
        furnishing,
        builtUpAreaUnit,
        bedrooms,
        bathrooms,
        kitchens,
        livingRooms,
        floorNumber,
        totalFloors,
        builtUpArea,
        parkingAvailable,
        elevator,
        security,
        waterSupply,
        electricity,
        unlockedSections,
        isTitleEdited,
        doing: initialDraft?.doing || 'creation',
    });

    const handleResumeDraft = async () => {
        if (!draftId) return;

        try {
            const response = await savePropertyDraft(draftId, buildDraftSnapshot(), initialDraft?.doing || 'creation');
            setDraftStatus('draft');
            setShowDraftBanner(false);
            setLastSavedAt(new Date(response.updated_at).toLocaleString());
        } catch (error) {
            console.error('Failed to resume draft:', error);
        }
    };

    const handleDiscardDraft = async () => {
        if (!draftId) return;

        try {
            await discardPropertyDraft(draftId);
            setDraftStatus('discarded');
            setShowDraftBanner(false);
        } catch (error) {
            console.error('Failed to discard draft:', error);
        }
    };

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <Header user={currentUser} />

            <div className="layout-container" style={{ maxWidth: '900px', paddingTop: '60px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary-light)', marginBottom: '12px' }}>List New Property</h1>
                    <p style={{ fontSize: '1rem', color: '#64748b' }}>Fill out the form below to list your property. Complete each section to unlock the next.</p>
                </div>

                {showDraftBanner && draftStatus !== 'published' && (
                    <div style={{ marginBottom: '28px', padding: '20px 22px', borderRadius: '18px', border: '1px solid rgba(10,107,255,0.18)', background: 'linear-gradient(180deg, rgba(10,107,255,0.08), rgba(10,107,255,0.03))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ maxWidth: '640px' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-primary)', marginBottom: '6px' }}>
                                    {draftStatus === 'discarded' ? 'Discarded draft' : 'Saved draft'}
                                </div>
                                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                                    You can continue editing from your last stage.
                                </div>
                                <div style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
                                    {draftStatus === 'discarded'
                                        ? 'This draft was discarded previously, but your changes can be resumed from this point.'
                                        : 'Your progress is being saved automatically so refreshes do not reset the form.'}
                                    {lastSavedAt ? ` Last saved ${lastSavedAt}.` : ''}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={handleResumeDraft}
                                    style={{ padding: '12px 18px', borderRadius: '999px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Edit from last session
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDiscardDraft}
                                    style={{ padding: '12px 18px', borderRadius: '999px', border: '1px solid #dbe4f0', background: 'white', color: '#334155', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <form action={createListing} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <input type="hidden" name="draftId" value={draftId ?? ''} />

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
                        errors={errors}
                        setErrors={setErrors}
                    />

                    <LocationInformation
                        unlocked={unlockedSections.includes(2)}
                        onComplete={() => handleCompleteSection(2)}
                        province={province}
                        setProvince={setProvince}
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
                        ward={ward}
                        setWard={setWard}
                        errors={errors}
                        setErrors={setErrors}
                    />

                    <NearbyLocationInformation
                        unlocked={unlockedSections.includes(3)}
                        onComplete={() => handleCompleteSection(3)}
                        nearbyLocations={nearbyLocations}
                        setNearbyLocations={setNearbyLocations}
                        landmark={landmark}
                        setLandmark={setLandmark}
                    />

                    <PropertyInformation
                        unlocked={unlockedSections.includes(4)}
                        selectedTypes={selectedTypes}
                        title={title}
                        setTitle={setTitle}
                        setIsTitleEdited={setIsTitleEdited}
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
                        uploadProgress={uploadProgress}
                        handleFileChange={handleFileChange}
                        removeImage={removeImage}
                        roadType={roadType}
                        setRoadType={setRoadType}
                        facingDirection={facingDirection}
                        setFacingDirection={setFacingDirection}
                        furnishing={furnishing}
                        setFurnishing={setFurnishing}
                        builtUpAreaUnit={builtUpAreaUnit}
                        setBuiltUpAreaUnit={setBuiltUpAreaUnit}
                        roadSizeUnit={roadSizeUnit}
                        roadSize={roadSize}
                        setRoadSize={setRoadSize}
                        bedrooms={bedrooms}
                        setBedrooms={setBedrooms}
                        bathrooms={bathrooms}
                        setBathrooms={setBathrooms}
                        kitchens={kitchens}
                        setKitchens={setKitchens}
                        livingRooms={livingRooms}
                        setLivingRooms={setLivingRooms}
                        floorNumber={floorNumber}
                        setFloorNumber={setFloorNumber}
                        totalFloors={totalFloors}
                        setTotalFloors={setTotalFloors}
                        builtUpArea={builtUpArea}
                        setBuiltUpArea={setBuiltUpArea}
                        parkingAvailable={parkingAvailable}
                        setParkingAvailable={setParkingAvailable}
                        elevator={elevator}
                        setElevator={setElevator}
                        security={security}
                        setSecurity={setSecurity}
                        waterSupply={waterSupply}
                        setWaterSupply={setWaterSupply}
                        electricity={electricity}
                        setElectricity={setElectricity}
                        errors={errors}
                        setErrors={setErrors}
                    />
                </form>
            </div>
        </main>
    );
}
