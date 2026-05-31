"use client";

import React from 'react';
import { Input, Checkbox } from '@/components/ui';
import { FormGrid, FormLabel, SelectableRadioCard } from '@/components/form';
import styles from './SellSectionSteps.module.css';

interface PricingInformationProps {
    unlocked: boolean;
    onComplete: () => void;
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
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const PricingInformation: React.FC<PricingInformationProps> = ({
    unlocked,
    onComplete,
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
    errors,
    setErrors,
}) => {
    if (!unlocked) return null;

    return (
        <div id="section-5" className={styles.section}>
            <h2 className={styles.heading}>5. Pricing Section</h2>

            <p className={styles.sectionNote}>Set the pricing structure before moving to the final publishing step.</p>

            <div className={styles.block}>
                <FormLabel>Pricing Type</FormLabel>
                <FormGrid cols={2} gap="12px">
                    <SelectableRadioCard name="pricingType" value="flat" label="Flat Price" selected={pricingType === 'flat'} onClick={() => setPricingType('flat')} />
                    <SelectableRadioCard name="pricingType" value="perUnit" label="Per Unit" selected={pricingType === 'perUnit'} onClick={() => setPricingType('perUnit')} />
                </FormGrid>
            </div>

            {pricingType === 'perUnit' && (
                <div className={styles.block}>
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
                    <Input
                        label="Price (NPR)"
                        name="price"
                        value={price}
                        onChange={(e) => {
                            setPrice(e.target.value);
                            setErrors(prev => ({ ...prev, price: '' }));
                        }}
                        required
                        error={errors.price}
                    />
                    {price && <div className={styles.priceHint}>{getPriceInWords(price)}</div>}
                </div>
                <div>
                    <Input label="Negotiable Price (Optional)" name="priceNegotiable" value={priceNegotiable} onChange={(e) => setPriceNegotiable(e.target.value)} />
                    {priceNegotiable && <div className={styles.priceHint}>{getPriceInWords(priceNegotiable)}</div>}
                </div>
            </FormGrid>

            <div className={styles.priceRow}>
                <div className={styles.priceColumn}>
                    <Input label="Rent Price (if applicable)" name="rentPrice" value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} />
                </div>
                <div className={styles.priceOffset}>
                    <Checkbox label="Price is Negotiable" name="negotiable" defaultChecked />
                </div>
            </div>

            <div className={styles.continueRow}>
                <button type="button" onClick={onComplete} className={styles.continueButton}>Continue to Publishing and Review →</button>
            </div>
        </div>
    );
};