"use client";

import React, { useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui';
import {
    FormGrid,
    FormLabel,
    SelectableRadioCard,
    SelectableCheckboxCard
} from '@/components/form';

const RequirementMap = dynamic(() => import('./RequirementMap'), {
    ssr: false,
    loading: () => <div style={{ height: '400px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
});

export default function RequirementsClient({ currentUser }: { currentUser: any }) {
    const [mode, setMode] = useState<'simple' | 'detailed'>('simple');
    const [propertyTypes, setPropertyTypes] = useState<string[]>(['house']);
    const [purposes, setPurposes] = useState<string[]>(['buy']);
    const [natures, setNatures] = useState<string[]>(['residential']);
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const [roadAccess, setRoadAccess] = useState('');
    const [facings, setFacings] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [pricingUnit, setPricingUnit] = useState('flat');
    const [remarks, setRemarks] = useState('');

    const [simpleDemand, setSimpleDemand] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [coords, setCoords] = useState<[number, number] | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const body = mode === 'simple' ? {
                mode,
                content: simpleDemand,
                userId: currentUser?.id
            } : {
                mode,
                propertyTypes: propertyTypes.join(','),
                purposes: purposes.join(','),
                natures: natures.join(','),
                facings: facings.join(','),
                district,
                cityVillage: city,
                area,
                roadAccess,
                minPrice: minPrice ? parseFloat(minPrice) : null,
                maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                pricingUnit,
                latitude: coords ? coords[0] : null,
                longitude: coords ? coords[1] : null,
                remarks,
                userId: currentUser?.id
            };

            const res = await fetch('/api/requirements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                // alert('Requirement posted successfully!');
                window.location.href = '/manage/requirements';
            } else {
                alert('Failed to post requirement.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    const typeOptions = [
        { label: 'House', value: 'house' },
        { label: 'Land', value: 'land' },
        { label: 'Apartment', value: 'apartment' },
        { label: 'Commercial Space', value: 'commercial' },
    ];

    const purposeOptions = [
        { label: 'Buy', value: 'buy' },
        { label: 'Rent', value: 'rent' },
        { label: 'Lease', value: 'lease' },
    ];

    const pricingUnits = [
        { label: 'Flat Price', value: 'flat' },
        { label: 'Per Month (Rent)', value: 'per_month' },
        { label: 'Per Month Per Unit', value: 'per_month_per_unit' },
        { label: 'Per Unit (e.g. per Aana)', value: 'per_unit' },
    ];

    const natureOptions = [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Semi-Commercial', value: 'semi_commercial' },
        { label: 'Agricultural', value: 'agricultural' },
        { label: 'Industrial', value: 'industrial' },
    ];

    const facingOptions = [
        { label: 'East', value: 'east' },
        { label: 'West', value: 'west' },
        { label: 'North', value: 'north' },
        { label: 'South', value: 'south' },
        { label: 'North East', value: 'north_east' },
        { label: 'North West', value: 'north_west' },
        { label: 'South East', value: 'south_east' },
        { label: 'South West', value: 'south_west' },
    ];

    const toggleMulti = (val: string, current: string[], setter: (v: string[]) => void) => {
        if (current.includes(val)) {
            setter(current.filter(i => i !== val));
        } else {
            setter([...current, val]);
        }
    };

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <SiteHeader user={currentUser} />

            <div className="layout-container" style={{ maxWidth: '800px', paddingTop: '60px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>Post Your Requirements</h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                        Can't find what you're looking for? Tell us your needs and let our network of premium agents find the perfect match for you.
                    </p>
                </div>

                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.03)' }}>
                    {/* Toggle Mode */}
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '14px', marginBottom: '40px' }}>
                        <button
                            onClick={() => setMode('simple')}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                                background: mode === 'simple' ? 'white' : 'transparent',
                                color: mode === 'simple' ? 'var(--color-primary)' : '#64748b',
                                fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                                boxShadow: mode === 'simple' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Express Demand (Quick)
                        </button>
                        <button
                            onClick={() => setMode('detailed')}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                                background: mode === 'detailed' ? 'white' : 'transparent',
                                color: mode === 'detailed' ? 'var(--color-primary)' : '#64748b',
                                fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                                boxShadow: mode === 'detailed' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Detailed Form
                        </button>
                    </div>

                    {mode === 'simple' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <FormLabel>Tell us what you are looking for</FormLabel>
                                <textarea
                                    placeholder="e.g. Looking for a 4BHK house in Maharajgunj with 2 car parking, budget around 5 Crore..."
                                    value={simpleDemand}
                                    onChange={(e) => setSimpleDemand(e.target.value)}
                                    style={{
                                        width: '100%', minHeight: '180px', padding: '16px', borderRadius: '12px',
                                        border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                                        fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6'
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    background: 'var(--color-primary)', color: 'white', padding: '16px', borderRadius: '12px',
                                    border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s',
                                    opacity: submitting ? 0.7 : 1
                                }}
                            >
                                {submitting ? 'POSTING...' : 'POST MY DEMAND'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Property Type */}
                            <div style={{ marginBottom: '8px' }}>
                                <FormLabel>Property Types (Select multiple)</FormLabel>
                                <FormGrid minWidth="150px" gap="12px">
                                    {typeOptions.map(opt => (
                                        <SelectableCheckboxCard
                                            key={opt.value}
                                            name="propertyType"
                                            value={opt.value}
                                            label={opt.label}
                                            checked={propertyTypes.includes(opt.value)}
                                            onClick={() => toggleMulti(opt.value, propertyTypes, setPropertyTypes)}
                                        />
                                    ))}
                                </FormGrid>
                            </div>

                            {/* Requirement Purpose */}
                            <div style={{ marginBottom: '8px' }}>
                                <FormLabel>Requirement Purposes</FormLabel>
                                <FormGrid minWidth="180px" gap="12px">
                                    {purposeOptions.map(opt => (
                                        <SelectableCheckboxCard
                                            key={opt.value}
                                            name="purpose"
                                            value={opt.value}
                                            label={opt.label}
                                            checked={purposes.includes(opt.value)}
                                            onClick={() => toggleMulti(opt.value, purposes, setPurposes)}
                                        />
                                    ))}
                                </FormGrid>
                            </div>

                            {/* Property Nature */}
                            <div style={{ marginBottom: '8px' }}>
                                <FormLabel>Property Natures</FormLabel>
                                <FormGrid minWidth="160px" gap="12px">
                                    {natureOptions.map(opt => (
                                        <SelectableCheckboxCard
                                            key={opt.value}
                                            name="nature"
                                            value={opt.value}
                                            label={opt.label}
                                            checked={natures.includes(opt.value)}
                                            onClick={() => toggleMulti(opt.value, natures, setNatures)}
                                        />
                                    ))}
                                </FormGrid>
                            </div>

                            {/* Facing Direction */}
                            <div style={{ marginBottom: '8px' }}>
                                <FormLabel>Preferred Facing Directions</FormLabel>
                                <FormGrid minWidth="130px" gap="10px">
                                    {facingOptions.map(opt => (
                                        <SelectableCheckboxCard
                                            key={opt.value}
                                            name="facing"
                                            value={opt.value}
                                            label={opt.label}
                                            checked={facings.includes(opt.value)}
                                            onClick={() => toggleMulti(opt.value, facings, setFacings)}
                                        />
                                    ))}
                                </FormGrid>
                            </div>

                            {/* Road Access & District */}
                            <FormGrid cols={2} gap="24px">
                                <Input
                                    label="Road Access (ft)"
                                    placeholder="Min road size required"
                                    value={roadAccess}
                                    onChange={(e) => setRoadAccess(e.target.value)}
                                />
                                <Input
                                    label="District"
                                    placeholder="e.g. Kathmandu"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                />
                            </FormGrid>

                            {/* City & Area */}
                            <FormGrid cols={2} gap="24px">
                                <Input
                                    label="City / Village"
                                    placeholder="e.g. Budhanilkantha"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                                <Input
                                    label="Area / Locality"
                                    placeholder="e.g. Deuba Chowk"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                />
                            </FormGrid>

                            {/* Map Interface */}
                            <div style={{
                                padding: '24px',
                                border: showMap ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                                borderRadius: '16px',
                                background: '#f8fafc',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '1.25rem' }}>📍</div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '0.95rem' }}>Map Selection Area</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Search locations or click map point.</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowMap(!showMap)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                            background: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                                            color: showMap ? '#ef4444' : 'var(--color-primary)'
                                        }}
                                    >
                                        {showMap ? 'Close Map' : 'Open Map Selector'}
                                    </button>
                                </div>

                                {showMap && (
                                    <RequirementMap
                                        selectedLocation={coords}
                                        onLocationSelect={(lat, lng) => setCoords([lat, lng])}
                                    />
                                )}
                            </div>

                            {/* Pricing Strategy */}
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <FormLabel>Pricing Logic</FormLabel>
                                    <FormGrid minWidth="200px" gap="12px">
                                        {pricingUnits.map(u => (
                                            <SelectableRadioCard
                                                key={u.value}
                                                name="pricingUnit"
                                                value={u.value}
                                                label={u.label}
                                                selected={pricingUnit === u.value}
                                                onClick={() => setPricingUnit(u.value)}
                                            />
                                        ))}
                                    </FormGrid>
                                </div>

                                <FormGrid cols={2} gap="24px">
                                    <Input
                                        label="Min Budget"
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                    <Input
                                        label="Max Budget"
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </FormGrid>
                            </div>

                            {/* Remarks */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <FormLabel>Additional Remarks (Optional)</FormLabel>
                                <textarea
                                    placeholder="Any other specific requirements, preferences, or details you'd like to share..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    style={{
                                        width: '100%', minHeight: '120px', padding: '16px', borderRadius: '12px',
                                        border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                                        fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6'
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    background: 'var(--color-primary)', color: 'white', padding: '18px', borderRadius: '12px',
                                    border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer',
                                    marginTop: '20px', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    opacity: submitting ? 0.7 : 1
                                }}
                            >
                                {submitting ? 'POSTING...' : '🚀 POST MY REQUIREMENTS'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
