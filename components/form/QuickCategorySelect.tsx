import React from 'react';

interface CategoryButton {
    label: string;
    icon: string;
}

interface QuickCategorySelectProps {
    categories: CategoryButton[];
    onSelect: (label: string, icon: string) => void;
    onCustom?: () => void;
    showCustom?: boolean;
}

/**
 * QuickCategorySelect - Icon-based category selector for nearby locations
 * Displays preset categories with icons and optional custom input
 */
export const QuickCategorySelect: React.FC<QuickCategorySelectProps> = ({
    categories,
    onSelect,
    onCustom,
    showCustom = true
}) => {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.map(item => (
                <button
                    key={item.label}
                    type="button"
                    onClick={() => onSelect(item.label, item.icon)}
                    style={{
                        padding: '8px 16px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '24px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = 'inherit';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}
            {showCustom && onCustom && (
                <button
                    type="button"
                    onClick={onCustom}
                    style={{
                        padding: '8px 16px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '24px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    ➕ Custom
                </button>
            )}
        </div>
    );
};
