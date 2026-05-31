"use client";

import React from 'react';
import { Input } from '@/components/ui';
import { FormGrid, FormLabel, PrivacyCheckboxCard } from '@/components/form';
import styles from './SellSectionSteps.module.css';

interface PublishingReviewInformationProps {
    unlocked: boolean;
    title: string;
    setTitle: (val: string) => void;
    setIsTitleEdited: (val: boolean) => void;
    selectedTypes: string[];
    selectedPurposes: string[];
    selectedNatures: string[];
    province: string;
    district: string;
    cityVillage: string;
    area: string;
    ward: string;
    landmark: string;
    nearbyLocations: Array<{ id: string; name: string; distance: number }>;
    pricingType: string;
    pricingUnit: string;
    price: string;
    priceNegotiable: string;
    rentPrice: string;
    uploadedImages: Array<{ url: string; type: string }>;
    getPriceInWords: (priceStr: string) => string;
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const joinValues = (items: string[]) => items.filter(Boolean).join(', ') || 'Not selected';

export const PublishingReviewInformation: React.FC<PublishingReviewInformationProps> = ({
    unlocked,
    title,
    setTitle,
    setIsTitleEdited,
    selectedTypes,
    selectedPurposes,
    selectedNatures,
    province,
    district,
    cityVillage,
    area,
    ward,
    landmark,
    nearbyLocations,
    pricingType,
    pricingUnit,
    price,
    priceNegotiable,
    rentPrice,
    uploadedImages,
    getPriceInWords,
    errors,
    setErrors,
}) => {
    if (!unlocked) return null;

    const locationLine = [province, district, cityVillage].filter(Boolean).join(' / ') || 'Not selected';
    const extraLocationLine = [area, ward, landmark].filter(Boolean).join(' / ') || 'None';
    const nearbyLine = nearbyLocations.length > 0
        ? nearbyLocations.map((location) => location.name).join(', ')
        : 'None added';

    return (
        <div id="section-6" className={styles.section}>
            <h2 className={styles.heading}>6. Publishing and Review</h2>

            <p className={styles.sectionNote}>Review the listing details one last time, add a title, and publish when ready.</p>

            <div className={styles.block}>
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

            <div className={styles.block}>
                <FormLabel>Visibility & Privacy</FormLabel>
                <div className={styles.privacyGrid}>
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
                </div>
            </div>

            <div className={styles.block}>
                <FormLabel>Review Summary</FormLabel>
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Property</div>
                        <div className={styles.summaryValue}>{joinValues(selectedTypes)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Purpose / Nature</div>
                        <div className={styles.summaryValue}>{joinValues(selectedPurposes)} · {joinValues(selectedNatures)}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Location</div>
                        <div className={styles.summaryValue}>{locationLine}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Area / Landmark</div>
                        <div className={styles.summaryValue}>{extraLocationLine}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Nearby</div>
                        <div className={styles.summaryValue}>{nearbyLine}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Pricing</div>
                        <div className={styles.summaryValue}>
                            {pricingType === 'perUnit' ? `Per unit (${pricingUnit})` : 'Flat price'}
                            {price ? ` · NPR ${price}` : ''}
                            {price && getPriceInWords(price) ? ` (${getPriceInWords(price)})` : ''}
                            {priceNegotiable ? ` · Negotiable: ${priceNegotiable}` : ''}
                            {rentPrice ? ` · Rent: ${rentPrice}` : ''}
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Photos</div>
                        <div className={styles.summaryValue}>{uploadedImages.length} uploaded image{uploadedImages.length === 1 ? '' : 's'}</div>
                    </div>
                </div>
            </div>

            <div className={styles.publishRow}>
                <button type="submit" className={styles.publishButton}>🚀 Publish Listing</button>
            </div>
        </div>
    );
};