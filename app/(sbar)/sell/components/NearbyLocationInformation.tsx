"use client";

import React from 'react';
import {
    FormGrid,
    FormLabel,
    NearbyLocationCard,
    QuickCategorySelect
} from '@/components/form';

interface NearbyLocationInformationProps {
    unlocked: boolean;
    onComplete: () => void;
    nearbyLocations: Array<{ id: string; name: string; distance: number }>;
    setNearbyLocations: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; distance: number }>>>;
}

const PRESET_CATEGORIES = [
    { label: 'Hospital', icon: '🏥' },
    { label: 'Gym', icon: '💪' },
    { label: 'Park', icon: '🌳' },
    { label: 'Pokhara', icon: '🏔️' },
    { label: 'Woda Office', icon: '🏢' },
    { label: 'Public Transport', icon: '🚌' },
    { label: 'School', icon: '🏫' },
    { label: 'Pharmacy', icon: '💊' },
    { label: 'Banquete', icon: '🎉' },
    { label: 'Restaurant', icon: '🍽️' },
    { label: 'Hotel', icon: '🏨' },
    { label: 'Atm', icon: '🏧' },
    { label: 'Police Station', icon: '🚓' },
    { label: 'Temple', icon: '🛕' },
    { label: 'Market', icon: '🛍️' },
    { label: 'Bank', icon: '🏦' },
    { label: 'Airport', icon: '✈️' },
    { label: 'Bus Stop', icon: '🚏' },
];

export const NearbyLocationInformation: React.FC<NearbyLocationInformationProps> = ({
    unlocked,
    onComplete,
    nearbyLocations,
    setNearbyLocations,
}) => {
    if (!unlocked) return null;

    const handleAddLocation = (label: string, icon?: string) => {
        const trimmedLabel = label.trim();
        if (!trimmedLabel) return;

        const normalizedLabel = trimmedLabel.toLowerCase();
        const preset = PRESET_CATEGORIES.find(c => c.label.toLowerCase() === normalizedLabel);

        const finalLabel = preset ? preset.label : trimmedLabel;
        const finalIcon = preset ? preset.icon : (icon || '📍');

        const isDuplicate = nearbyLocations.some(loc => {
            const parts = loc.name.split(' ');
            const existingLabel = parts.length > 1 ? parts.slice(1).join(' ') : loc.name;
            return existingLabel.toLowerCase() === finalLabel.toLowerCase();
        });

        if (isDuplicate) return;

        setNearbyLocations(prev => [...prev, {
            id: Math.random().toString(),
            name: `${finalIcon} ${finalLabel}`,
            distance: 500
        }]);
    };

    const availableCategories = PRESET_CATEGORIES.filter(cat => {
        return !nearbyLocations.some(loc => {
            const parts = loc.name.split(' ');
            const existingLabel = parts.length > 1 ? parts.slice(1).join(' ') : loc.name;
            return existingLabel.toLowerCase() === cat.label.toLowerCase();
        });
    });

    return (
        <div id="section-3" style={{ padding: '0 0 60px 0', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--color-primary-light)', marginBottom: '48px', borderBottom: '4px solid var(--color-primary)', paddingBottom: '20px', width: '100%' }}>
                3. Nearby Location
            </h2>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Nearby Location</FormLabel>

                <FormGrid minWidth="280px" gap="16px">
                    {nearbyLocations.map((loc) => (
                        <NearbyLocationCard
                            key={loc.id}
                            id={loc.id}
                            name={loc.name}
                            distance={loc.distance}
                            onRemove={() => setNearbyLocations(prev => prev.filter(l => l.id !== loc.id))}
                            onDistanceChange={(newDistance) => setNearbyLocations(prev => prev.map(l => l.id === loc.id ? { ...l, distance: newDistance } : l))}
                        />
                    ))}
                </FormGrid>

                <div style={{ marginTop: '24px' }}>
                    <QuickCategorySelect
                        categories={availableCategories}
                        onSelect={(label, icon) => handleAddLocation(label, icon)}
                        onCustom={() => {
                            const name = prompt('Enter nearby location name (e.g. Shopping Mall):');
                            if (name) handleAddLocation(name);
                        }}
                    />
                </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onComplete} style={{ padding: '16px 40px', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}>Continue to Property Information →</button>
            </div>
        </div>
    );
};
