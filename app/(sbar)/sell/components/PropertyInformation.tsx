"use client";

import React from 'react';
import { Input, Checkbox } from '@/components/ui';
import { FormGrid, FormLabel, SelectableRadioCard } from '@/components/form';
import styles from './PropertyInformation.module.css';

interface PropertyInformationProps {
    unlocked: boolean;
    onComplete: () => void;
    selectedTypes: string[];
    roadType: string;
    setRoadType: (val: string) => void;
    facingDirection: string;
    setFacingDirection: (val: string) => void;
    furnishing: string;
    setFurnishing: (val: string) => void;
    builtUpAreaUnit: string;
    setBuiltUpAreaUnit: (val: string) => void;
    roadSizeUnit: string;
    roadSize: string;
    setRoadSize: (val: string) => void;
    bedrooms: string;
    setBedrooms: (val: string) => void;
    bathrooms: string;
    setBathrooms: (val: string) => void;
    kitchens: string;
    setKitchens: (val: string) => void;
    livingRooms: string;
    setLivingRooms: (val: string) => void;
    floorNumber: string;
    setFloorNumber: (val: string) => void;
    totalFloors: string;
    setTotalFloors: (val: string) => void;
    builtUpArea: string;
    setBuiltUpArea: (val: string) => void;
    parkingAvailable: boolean;
    setParkingAvailable: (val: boolean) => void;
    elevator: boolean;
    setElevator: (val: boolean) => void;
    security: boolean;
    setSecurity: (val: boolean) => void;
    waterSupply: boolean;
    setWaterSupply: (val: boolean) => void;
    electricity: boolean;
    setElectricity: (val: boolean) => void;
    uploadedImages: Array<{ url: string; type: string }>;
    uploading: boolean;
    uploadProgress: {
        fileName: string;
        previewUrl: string;
        progress: number;
        status: 'compressing' | 'preparing' | 'uploading';
    } | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, imageType: string) => void;
    removeImage: (index: number) => void;
}

export const PropertyInformation: React.FC<PropertyInformationProps> = ({
    unlocked,
    onComplete,
    selectedTypes,
    roadType,
    setRoadType,
    facingDirection,
    setFacingDirection,
    furnishing,
    setFurnishing,
    builtUpAreaUnit,
    setBuiltUpAreaUnit,
    roadSizeUnit,
    roadSize,
    setRoadSize,
    bedrooms,
    setBedrooms,
    bathrooms,
    setBathrooms,
    kitchens,
    setKitchens,
    livingRooms,
    setLivingRooms,
    floorNumber,
    setFloorNumber,
    totalFloors,
    setTotalFloors,
    builtUpArea,
    setBuiltUpArea,
    parkingAvailable,
    setParkingAvailable,
    elevator,
    setElevator,
    security,
    setSecurity,
    waterSupply,
    setWaterSupply,
    electricity,
    setElectricity,
    uploadedImages,
    uploadProgress,
    handleFileChange,
    removeImage,
}) => {
    if (!unlocked) return null;

    return (
        <div id="section-4" className={styles.section}>
            <h2 className={styles.heading}>4. Property Information</h2>

            <div className={styles.block}>
                <FormLabel>Access & Specifics</FormLabel>

                <div className={styles.subBlock}>
                    <FormLabel>Road Type</FormLabel>
                    <FormGrid minWidth="150px" gap="10px">
                        {['Blacktopped', 'Gravel', 'Soil', 'Paved'].map(val => (
                            <SelectableRadioCard key={val} name="roadType" value={val} label={val} selected={roadType === val} onClick={() => setRoadType(val)} />
                        ))}
                    </FormGrid>
                </div>

                <div className={styles.subBlock}>
                    <Input label="Road Size" name="roadSize" placeholder={`e.g. 13 ${roadSizeUnit || 'ft'}`} value={roadSize} onChange={(e) => setRoadSize(e.target.value)} />
                    <div className={styles.helper}>Default unit: {roadSizeUnit || 'ft'}</div>
                </div>

                <div className={styles.subBlock}>
                    <FormLabel>Facing Direction</FormLabel>
                    <FormGrid minWidth="130px" gap="8px">
                        {['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'].map(val => (
                            <SelectableRadioCard key={val} name="facingDirection" value={val} label={val} selected={facingDirection === val} onClick={() => setFacingDirection(val)} />
                        ))}
                    </FormGrid>
                </div>
            </div>

            {(selectedTypes.includes('house') || selectedTypes.includes('apartment') || selectedTypes.includes('villa')) && (
                <div className={styles.featureCard}>
                    <FormGrid cols={3} gap="24px">
                        <Input label="Bedrooms" name="bedrooms" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                        <Input label="Bathrooms" name="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                        <Input label="Kitchens" name="kitchens" type="number" value={kitchens} onChange={(e) => setKitchens(e.target.value)} />
                        <Input label="Living Rooms" name="livingRooms" type="number" value={livingRooms} onChange={(e) => setLivingRooms(e.target.value)} />
                        <Input label="Floor No." name="floorNumber" type="number" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} />
                        <Input label="Total Floors" name="totalFloors" type="number" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} />
                        <Input label="Built-up Area" name="builtUpArea" type="number" value={builtUpArea} onChange={(e) => setBuiltUpArea(e.target.value)} />

                        <div className={styles.fullWidthRow}>
                            <FormLabel>Furnishing</FormLabel>
                            <FormGrid minWidth="160px" gap="10px">
                                {['Unfurnished', 'Semi-furnished', 'Full-furnished'].map(val => (
                                    <SelectableRadioCard key={val} name="furnishing" value={val} label={val} selected={furnishing === val} onClick={() => setFurnishing(val)} />
                                ))}
                            </FormGrid>
                        </div>

                        <div className={styles.fullWidthRow}>
                            <FormLabel>Area Unit</FormLabel>
                            <FormGrid minWidth="140px" gap="10px">
                                {[
                                    { label: 'Sq. Ft.', value: 'sqft' },
                                    { label: 'Sq. M.', value: 'sqm' },
                                    { label: 'Aana', value: 'aana' },
                                    { label: 'Ropani', value: 'ropani' }
                                ].map(opt => (
                                    <SelectableRadioCard key={opt.value} name="builtUpAreaUnit" value={opt.value} label={opt.label} selected={builtUpAreaUnit === opt.value} onClick={() => setBuiltUpAreaUnit(opt.value)} />
                                ))}
                            </FormGrid>
                        </div>
                    </FormGrid>
                </div>
            )}

            <div className={styles.block}>
                <FormGrid minWidth="150px" gap="12px">
                    <Checkbox label="Parking" name="parkingAvailable" checked={parkingAvailable} onChange={(e) => setParkingAvailable(e.target.checked)} />
                    <Checkbox label="Elevator" name="elevator" checked={elevator} onChange={(e) => setElevator(e.target.checked)} />
                    <Checkbox label="Security" name="security" checked={security} onChange={(e) => setSecurity(e.target.checked)} />
                    <Checkbox label="Water" name="waterSupply" checked={waterSupply} onChange={(e) => setWaterSupply(e.target.checked)} />
                    <Checkbox label="Electricity" name="electricity" checked={electricity} onChange={(e) => setElectricity(e.target.checked)} />
                </FormGrid>
            </div>

            <div className={styles.block}>
                <FormLabel>Property Media</FormLabel>
                <FormGrid minWidth="130px" gap="16px">
                    {['livingroom', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'other'].map(room => (
                        <div key={room} className={styles.mediaTile}>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, room)} id={`file-${room}`} className={styles.hiddenInput} />
                            <label htmlFor={`file-${room}`} className={styles.mediaLabel}>
                                <span className={styles.mediaIcon}>📷</span>
                                <span className={styles.mediaName}>{room}</span>
                            </label>
                        </div>
                    ))}
                </FormGrid>

                <div className={styles.uploadedGrid}>
                    {uploadedImages.map((img, idx) => (
                        <div key={idx} className={styles.uploadedItem}>
                            <img src={img.url} alt="upload" className={styles.uploadedImage} />
                            <button type="button" onClick={() => removeImage(idx)} className={styles.removeButton}>×</button>
                            <input type="hidden" name="image_url" value={img.url} />
                            <input type="hidden" name="image_of" value={img.type} />
                        </div>
                    ))}

                    {uploadProgress && (
                        <div className={styles.uploadingCard}>
                            <div className={styles.uploadingPreview}>
                                <img src={uploadProgress.previewUrl} alt={uploadProgress.fileName} className={styles.uploadingPreviewImg} />
                                <div className={styles.uploadingOverlay}>
                                    {uploadProgress.status === 'compressing'
                                        ? 'Processing...'
                                        : uploadProgress.status === 'preparing'
                                            ? 'Preparing...'
                                            : `${uploadProgress.progress}%`}
                                </div>
                            </div>
                            <div className={styles.uploadingMeta}>
                                <div title={uploadProgress.fileName} className={styles.uploadingName}>
                                    {uploadProgress.fileName}
                                </div>
                                <div className={styles.uploadingBarTrack}>
                                                    <progress
                                                        className={styles.uploadingBarFill}
                                                        value={uploadProgress.status === 'compressing' || uploadProgress.status === 'preparing' ? 12 : uploadProgress.progress}
                                                        max={100}
                                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.continueRow}>
                <button type="button" onClick={onComplete} className={styles.continueButton}>Continue to Pricing Section →</button>
            </div>
        </div>
    );
};
