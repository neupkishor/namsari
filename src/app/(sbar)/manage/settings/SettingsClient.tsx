'use client';

import { useState } from 'react';
import { updatePropertyTypeCount, syncPropertyTypeCounts } from '@/actions/settings';

export default function SettingsClient({ propertyTypes }: { propertyTypes: any[] }) {
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState<Record<number, number>>(
        Object.fromEntries(propertyTypes.map(pt => [pt.id, pt.propertyCount || 0]))
    );

    async function handleUpdate(id: number) {
        setLoading(true);
        try {
            await updatePropertyTypeCount(id, counts[id]);
            alert('Updated successfully');
        } catch (e) {
            alert('Failed to update');
        } finally {
            setLoading(false);
        }
    }

    async function handleSync() {
        if (!confirm('This will count all approved properties in the database and overwrite the current values. Continue?')) return;
        setLoading(true);
        try {
            await syncPropertyTypeCounts();
            // We would need to refresh the page here to see new values if we don't return them
            window.location.reload();
        } catch (e) {
            alert('Sync failed');
            setLoading(false);
        }
    }

    return (
        <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                    Property Category Counts
                </h2>
                <button 
                    onClick={handleSync} 
                    disabled={loading}
                    className="btn-secondary"
                    style={{ fontSize: '0.9rem' }}
                >
                    {loading ? 'Syncing...' : 'Sync from Database'}
                </button>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>
                These counts are displayed on the homepage "Popular Categories" section. You can manually override them or sync with actual database records.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {propertyTypes.map((type) => (
                    <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{type.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {type.id}</div>
                        </div>
                        <input 
                            type="number" 
                            value={counts[type.id]} 
                            onChange={(e) => setCounts(prev => ({ ...prev, [type.id]: parseInt(e.target.value) || 0 }))}
                            style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <button 
                            onClick={() => handleUpdate(type.id)}
                            disabled={loading}
                            className="btn-primary"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        >
                            Save
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}