import React from 'react';

interface PrivacyCheckboxCardProps {
    id: string;
    name: string;
    title: string;
    description: string;
    defaultChecked?: boolean;
}

/**
 * PrivacyCheckboxCard - Interactive card for privacy/visibility settings
 * Used for "Mark as Private" and "Don't show on website" options
 */
export const PrivacyCheckboxCard: React.FC<PrivacyCheckboxCardProps> = ({
    id,
    name,
    title,
    description,
    defaultChecked = false
}) => {
    const handleCardClick = () => {
        const checkbox = document.getElementById(id) as HTMLInputElement;
        if (checkbox) checkbox.click();
    };

    return (
        <div
            style={{
                padding: '16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
            onClick={handleCardClick}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <input
                type="checkbox"
                name={name}
                id={id}
                defaultChecked={defaultChecked}
                style={{ marginTop: '4px', cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{title}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
                    {description}
                </span>
            </div>
        </div>
    );
};
