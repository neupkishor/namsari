import React from 'react';

interface GeoLocationInputProps {
    value: string;
    onChange: (value: string) => void;
    onFetch: () => void;
    onClear: () => void;
    hasCoords: boolean;
    isFetching: boolean;
    latitude?: string;
    longitude?: string;
    disabled?: boolean;
}

/**
 * GeoLocationInput - Specialized input for handling Google Maps URLs or coordinates
 * Features a fetch/clear button and hidden inputs for lat/lng
 */
export const GeoLocationInput: React.FC<GeoLocationInputProps> = ({
    value,
    onChange,
    onFetch,
    onClear,
    hasCoords,
    isFetching,
    latitude,
    longitude,
    disabled = false
}) => {
    return (
        <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569', display: 'block', marginBottom: '8px' }}>
                    Geo Location
                </label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Pass Google Maps URL or location coordinates"
                    disabled={disabled || hasCoords}
                    style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '48px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        backgroundColor: (disabled || hasCoords) ? '#f8fafc' : 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
            </div>
            <button
                type="button"
                onClick={hasCoords ? onClear : onFetch}
                style={{
                    position: 'absolute',
                    right: '12px',
                    top: '38px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    color: hasCoords ? '#ef4444' : 'var(--color-primary)',
                    zIndex: 10
                }}
            >
                {isFetching ? '...' : (hasCoords ? '✕' : '📍')}
            </button>
            {hasCoords && latitude && longitude && (
                <>
                    <input type="hidden" name="latitude" value={latitude} />
                    <input type="hidden" name="longitude" value={longitude} />
                </>
            )}
        </div>
    );
};
