"use client";

import React from 'react';
import { Input, Checkbox } from '@/components/ui';
import {
    FormGrid,
    FormLabel,
    SelectableCheckboxCard,
    PrivacyCheckboxCard
} from '@/components/form';

interface BasicInformationProps {
    unlocked: boolean;
    onComplete: () => void;
    // Types
    selectedTypes: string[];
    typeOptions: any[];
    isTypeDisabled: (val: string) => boolean;
    handleTypeChange: (val: string) => void;
    // Purposes
    selectedPurposes: string[];
    handlePurposeChange: (val: string) => void;
    // Natures
    selectedNatures: string[];
    natureOptions: any[];
    handleNatureChange: (val: string) => void;
    // Title
    title: string;
    setTitle: (val: string) => void;
    setIsTitleEdited: (val: boolean) => void;
    // Errors
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
    unlocked,
    onComplete,
    selectedTypes,
    typeOptions,
    isTypeDisabled,
    handleTypeChange,
    selectedPurposes,
    handlePurposeChange,
    selectedNatures,
    natureOptions,
    handleNatureChange,
    title,
    setTitle,
    setIsTitleEdited,
    errors,
    setErrors
}) => {
    if (!unlocked) return null;

    return (
        <div id="section-1" style={{ padding: '0 0 60px 0', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#1e293b', marginBottom: '48px', borderBottom: '4px solid var(--color-primary)', paddingBottom: '20px', width: '100%' }}>
                1. Basic Information
            </h2>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Property Type</FormLabel>
                <FormGrid minWidth="180px" gap="12px">
                    {typeOptions.map(opt => {
                        const disabled = isTypeDisabled(opt.value);
                        return (
                            <SelectableCheckboxCard
                                key={opt.value}
                                value={opt.value}
                                label={opt.label}
                                name="propertyType"
                                checked={selectedTypes.includes(opt.value)}
                                onClick={() => {
                                    if (!disabled) {
                                        handleTypeChange(opt.value);
                                        setErrors(prev => ({ ...prev, type: '' }));
                                    }
                                }}
                                disabled={disabled}
                                error={!!errors.type}
                            />
                        );
                    })}
                </FormGrid>
                {errors.type && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '500', marginTop: '8px', display: 'block' }}>{errors.type}</span>}
            </div>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Property Purpose</FormLabel>
                <FormGrid minWidth="180px" gap="12px">
                    {['sale', 'rent'].map(opt => (
                        <SelectableCheckboxCard
                            key={opt}
                            value={opt}
                            label={opt === 'sale' ? 'For Sale' : 'For Rent'}
                            name="propertyPurpose"
                            checked={selectedPurposes.includes(opt)}
                            onClick={() => {
                                handlePurposeChange(opt);
                                setErrors(prev => ({ ...prev, purpose: '' }));
                            }}
                            error={!!errors.purpose}
                        />
                    ))}
                </FormGrid>
                {errors.purpose && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '500', marginTop: '8px', display: 'block' }}>{errors.purpose}</span>}
            </div>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Property Nature</FormLabel>
                <FormGrid minWidth="180px" gap="12px">
                    {natureOptions.map(opt => (
                        <SelectableCheckboxCard
                            key={opt.value}
                            value={opt.value}
                            label={opt.label}
                            name="propertyNature"
                            checked={selectedNatures.includes(opt.value)}
                            onClick={() => handleNatureChange(opt.value)}
                        />
                    ))}
                </FormGrid>
            </div>

            <div style={{ marginBottom: '40px' }}>
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
            </div>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Visibility & Privacy</FormLabel>
                <FormGrid minWidth="280px" gap="12px">
                    <PrivacyCheckboxCard
                        id="isPrivate-cb"
                        name="isPrivate"
                        title="Mark as Private"
                        description="Don't add exact images to your private listing if you want to hide details."
                    />
                    <PrivacyCheckboxCard
                        id="dontShow-cb"
                        name="dontShowOnWebsite"
                        title="Don't show on website"
                        description="Will be private only for your management."
                    />
                </FormGrid>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onComplete} style={{ padding: '16px 40px', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}>Continue to Location Information →</button>
            </div>
        </div>
    );
};
