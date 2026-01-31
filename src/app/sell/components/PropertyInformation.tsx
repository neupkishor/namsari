"use client";

import React from 'react';
import { Input, Checkbox } from '@/components/ui';
import {
    FormGrid,
    FormLabel,
    FormCard,
    SectionTitle,
    SelectableRadioCard
} from '@/components/form';

interface PropertyInformationProps {
    unlocked: boolean;
    selectedTypes: string[];
    // Road & Facing
    roadType: string;
    setRoadType: (val: string) => void;
    facingDirection: string;
    setFacingDirection: (val: string) => void;
    // Specifics
    furnishing: string;
    setFurnishing: (val: string) => void;
    builtUpAreaUnit: string;
    setBuiltUpAreaUnit: (val: string) => void;
    // Pricing
    pricingType: string;
    setPricingType: (val: string) => void;
    pricingUnit: string;
    setPricingUnit: (val: string) => void;
    price: string;
    setPrice: (val: string) => void;
    priceNegotiable: string;
    setPriceNegotiable: (val: string) => void;
    rentPrice: string;
    setRentPrice: (val: string) => void;
    getPriceInWords: (priceStr: string) => string;
    // Media
    uploadedImages: Array<{ url: string; type: string }>;
    uploading: boolean;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, imageType: string) => void;
    removeImage: (index: number) => void;
    // Ownership
    users: any[];
    currentUserId: number;
    ownerId: string;
    setOwnerId: (val: string) => void;
    authorizedPersonId: string;
    setAuthorizedPersonId: (val: string) => void;
    // Errors
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const PropertyInformation: React.FC<PropertyInformationProps> = ({
    unlocked,
    selectedTypes,
    roadType,
    setRoadType,
    facingDirection,
    setFacingDirection,
    furnishing,
    setFurnishing,
    builtUpAreaUnit,
    setBuiltUpAreaUnit,
    pricingType,
    setPricingType,
    pricingUnit,
    setPricingUnit,
    price,
    setPrice,
    priceNegotiable,
    setPriceNegotiable,
    rentPrice,
    setRentPrice,
    getPriceInWords,
    uploadedImages,
    uploading,
    handleFileChange,
    removeImage,
    users,
    currentUserId,
    ownerId,
    setOwnerId,
    authorizedPersonId,
    setAuthorizedPersonId,
    errors,
    setErrors
}) => {
    if (!unlocked) return null;

    return (
        <div id="section-3" style={{ padding: '0 0 60px 0', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#1e293b', marginBottom: '48px', borderBottom: '4px solid var(--color-primary)', paddingBottom: '20px', width: '100%' }}>
                3. Property Information
            </h2>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Access & Specifics</FormLabel>

                <div style={{ marginBottom: '24px' }}>
                    <FormLabel>Road Type</FormLabel>
                    <FormGrid minWidth="150px" gap="10px">
                        {['Blacktopped', 'Gravel', 'Soil', 'Paved'].map(val => (
                            <SelectableRadioCard key={val} name="roadType" value={val} label={val} selected={roadType === val} onClick={() => setRoadType(val)} />
                        ))}
                    </FormGrid>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Input label="Road Size" name="roadSize" placeholder="e.g. 13 ft" />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <FormLabel>Facing Direction</FormLabel>
                    <FormGrid minWidth="130px" gap="8px">
                        {['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'].map(val => (
                            <SelectableRadioCard key={val} name="facingDirection" value={val} label={val} selected={facingDirection === val} onClick={() => setFacingDirection(val)} />
                        ))}
                    </FormGrid>
                </div>
            </div>

            {(selectedTypes.includes('house') || selectedTypes.includes('apartment') || selectedTypes.includes('villa')) && (
                <FormCard padding="0" background="transparent" border="none" style={{ marginBottom: '40px' }}>
                    <FormGrid cols={3} gap="24px">
                        <Input label="Bedrooms" name="bedrooms" type="number" />
                        <Input label="Bathrooms" name="bathrooms" type="number" />
                        <Input label="Kitchens" name="kitchens" type="number" />
                        <Input label="Living Rooms" name="livingRooms" type="number" />
                        <Input label="Floor No." name="floorNumber" type="number" />
                        <Input label="Total Floors" name="totalFloors" type="number" />
                        <Input label="Built-up Area" name="builtUpArea" type="number" />

                        <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                            <FormLabel>Furnishing</FormLabel>
                            <FormGrid minWidth="160px" gap="10px">
                                {['Unfurnished', 'Semi-furnished', 'Full-furnished'].map(val => (
                                    <SelectableRadioCard key={val} name="furnishing" value={val} label={val} selected={furnishing === val} onClick={() => setFurnishing(val)} />
                                ))}
                            </FormGrid>
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
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
                </FormCard>
            )}

            <div style={{ marginBottom: '40px' }}>
                <FormGrid minWidth="150px" gap="12px">
                    <Checkbox label="Parking" name="parkingAvailable" />
                    <Checkbox label="Elevator" name="elevator" />
                    <Checkbox label="Security" name="security" />
                    <Checkbox label="Water" name="waterSupply" />
                    <Checkbox label="Electricity" name="electricity" />
                </FormGrid>
            </div>



            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Property Media</FormLabel>
                <FormGrid minWidth="130px" gap="16px">
                    {['livingroom', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'other'].map(room => (
                        <div key={room} style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, room)} id={`file-${room}`} style={{ display: 'none' }} />
                            <label htmlFor={`file-${room}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.1rem' }}>📷</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'capitalize' }}>{room}</span>
                            </label>
                        </div>
                    ))}
                </FormGrid>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
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

            <FormCard padding="0" background="transparent" border="none" style={{ marginBottom: '40px' }}>
                <SectionTitle color="#0369a1">Ownership & Authorization</SectionTitle>

                <div style={{ marginBottom: '24px' }}>
                    <FormLabel>Property Owner</FormLabel>
                    <FormGrid minWidth="200px" gap="10px">
                        {users.map(u => (
                            <SelectableRadioCard key={u.id} name="ownerId" value={u.id.toString()} label={`${u.name} (${u.phone})`} selected={ownerId === u.id.toString()} onClick={() => setOwnerId(u.id.toString())} />
                        ))}
                    </FormGrid>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <FormLabel>Authorized Person (Optional)</FormLabel>
                    <FormGrid minWidth="200px" gap="10px">
                        <SelectableRadioCard name="authorizedPersonId" value="" label="None / Self" selected={authorizedPersonId === ''} onClick={() => setAuthorizedPersonId('')} />
                        {users.map(u => (
                            <SelectableRadioCard key={u.id} name="authorizedPersonId" value={u.id.toString()} label={`${u.name} (${u.phone})`} selected={authorizedPersonId === u.id.toString()} onClick={() => setAuthorizedPersonId(u.id.toString())} />
                        ))}
                    </FormGrid>
                </div>
            </FormCard>

            <FormCard padding="0" background="transparent" border="none" style={{ marginBottom: '40px' }}>
                <SectionTitle>Pricing Details</SectionTitle>

                <div style={{ marginBottom: '24px' }}>
                    <FormLabel>Pricing Type</FormLabel>
                    <FormGrid cols={2} gap="12px">
                        <SelectableRadioCard name="pricingType" value="flat" label="Flat Price" selected={pricingType === 'flat'} onClick={() => setPricingType('flat')} />
                        <SelectableRadioCard name="pricingType" value="perUnit" label="Per Unit" selected={pricingType === 'perUnit'} onClick={() => setPricingType('perUnit')} />
                    </FormGrid>
                </div>

                {pricingType === 'perUnit' && (
                    <div style={{ marginBottom: '24px' }}>
                        <FormLabel>Unit</FormLabel>
                        <FormGrid minWidth="150px" gap="10px">
                            {[
                                { label: 'Meter Sq.', value: 'meterSquare' },
                                { label: 'Aana', value: 'aana' },
                                { label: 'Ropani', value: 'ropani' }
                            ].map(opt => (
                                <SelectableRadioCard key={opt.value} name="unit" value={opt.value} label={opt.label} selected={pricingUnit === opt.value} onClick={() => setPricingUnit(opt.value)} />
                            ))}
                        </FormGrid>
                    </div>
                )}

                <FormGrid cols={2} gap="24px">
                    <div>
                        <Input label="Price (NPR)" name="price" value={price} onChange={(e) => { setPrice(e.target.value); setErrors(prev => ({ ...prev, price: '' })); }} required error={errors.price} />
                        {price && <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '4px', textTransform: 'capitalize' }}>{getPriceInWords(price)}</div>}
                    </div>
                    <div>
                        <Input label="Negotiable Price (Optional)" name="priceNegotiable" value={priceNegotiable} onChange={(e) => setPriceNegotiable(e.target.value)} />
                        {priceNegotiable && <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '4px', textTransform: 'capitalize' }}>{getPriceInWords(priceNegotiable)}</div>}
                    </div>
                </FormGrid>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <Input label="Rent Price (if applicable)" name="rentPrice" value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} />
                    </div>
                    <div style={{ paddingTop: '32px' }}>
                        <Checkbox label="Price is Negotiable" name="negotiable" defaultChecked />
                    </div>
                </div>
            </FormCard>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                <button type="submit" style={{ padding: '20px 60px', background: 'var(--color-primary)', color: 'white', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>🚀 Publish Listing</button>
            </div>
        </div>
    );
};
