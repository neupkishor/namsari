import React from 'react';

interface SelectableCheckboxCardProps {
    value: string;
    label: string;
    name: string;
    checked: boolean;
    onClick: () => void;
    disabled?: boolean;
    error?: boolean;
}

/**
 * SelectableCheckboxCard - Interactive checkbox card for multi-select options
 * Used for property type, nature, and purpose selection
 */
export const SelectableCheckboxCard: React.FC<SelectableCheckboxCardProps> = ({
    value,
    label,
    name,
    checked,
    onClick,
    disabled = false,
    error = false
}) => {
    return (
        <div
            onClick={onClick}
            style={{
                padding: '12px',
                border: '1px solid',
                borderColor: checked ? 'var(--color-primary)' : (error ? '#ef4444' : '#e2e8f0'),
                borderRadius: '8px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: checked ? '#f0f9ff' : 'white',
                opacity: disabled ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
            }}
        >
            <input
                type="checkbox"
                name={name}
                value={value}
                checked={checked}
                readOnly
                disabled={disabled}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{label}</span>
        </div>
    );
};
