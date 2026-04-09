import React from 'react';

interface NearbyLocationCardProps {
    id: string;
    name: string;
    distance: number;
    onRemove: () => void;
    onDistanceChange: (newDistance: number) => void;
}

/**
 * NearbyLocationCard - Card displaying a nearby location with distance controls
 * Features +/- buttons for adjusting distance and a remove button
 */
export const NearbyLocationCard: React.FC<NearbyLocationCardProps> = ({
    id,
    name,
    distance,
    onRemove,
    onDistanceChange
}) => {
    const formatDistance = (dist: number) => {
        return dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist} m`;
    };

    return (
        <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                    {name}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    style={{
                        border: 'none',
                        background: '#fee2e2',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ✕
                </button>
            </div>

            <div style={{
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    fontWeight: '600',
                    marginBottom: '8px'
                }}>
                    Approx. Distance
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-light)' }}>
                        {formatDistance(distance)}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                            type="button"
                            onClick={() => onDistanceChange(Math.max(0, distance - 100))}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}
                        >
                            -100
                        </button>
                        <button
                            type="button"
                            onClick={() => onDistanceChange(distance + 100)}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}
                        >
                            +100
                        </button>
                        <button
                            type="button"
                            onClick={() => onDistanceChange(distance + 500)}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}
                        >
                            +500
                        </button>
                    </div>
                </div>
            </div>

            <input type="hidden" name="nearby_location_name" value={name} />
            <input type="hidden" name="nearby_location_distance" value={distance} />
        </div>
    );
};
