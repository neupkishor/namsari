import React from 'react';

interface SelectableRadioCardProps {
    value: string;
    label: string | React.ReactNode;
    name: string;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
    error?: boolean;
}

/**
 * SelectableRadioCard - Interactive card for single-select options with a circular indicator
 */
export const SelectableRadioCard: React.FC<SelectableRadioCardProps> = ({
    value,
    label,
    name,
    selected,
    onClick,
    disabled = false,
    error = false
}) => {
    return (
        <div
            onClick={onClick}
            style={{
                padding: '12px 16px',
                border: '1px solid',
                borderColor: selected ? 'var(--color-primary)' : (error ? '#ef4444' : '#e2e8f0'),
                borderRadius: '8px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: selected ? '#f0f9ff' : 'white',
                opacity: disabled ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s',
                height: '100%'
            }}
        >
            <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: selected ? '5px solid var(--color-primary)' : '2px solid #cbd5e1',
                background: 'white',
                transition: 'all 0.2s',
                flexShrink: 0
            }} />
            <input
                type="radio"
                name={name}
                value={value}
                checked={selected}
                readOnly
                disabled={disabled}
                style={{ display: 'none' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: selected ? 'var(--color-primary-light)' : '#64748b' }}>
                {label}
            </span>
        </div>
    );
};
