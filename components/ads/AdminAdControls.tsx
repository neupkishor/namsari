'use client';

import { updateAdStatus, updateAdDetails } from '@/actions/ads';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAdControls({ ad }: { ad: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form State
    const [title, setTitle] = useState(ad.title || '');
    const [link, setLink] = useState(ad.link || '');
    const [position, setPosition] = useState(ad.position || 'feed');
    const [budget, setBudget] = useState(ad.budget || 0);
    const [durationDays, setDurationDays] = useState(ad.durationDays || 0);

    async function handleStatusChange(status: string) {
        if (!confirm(`Are you sure you want to change status to ${status}?`)) return;
        setLoading(true);
        try {
            await updateAdStatus(ad.id, status);
            router.refresh();
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveDetails() {
        setLoading(true);
        try {
            await updateAdDetails(ad.id, {
                title,
                link,
                position,
                budget: parseFloat(String(budget)),
                durationDays: parseInt(String(durationDays))
            });
            setIsEditing(false);
            router.refresh();
        } catch (err) {
            alert('Failed to update details');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card" style={{ padding: '24px', marginTop: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                    Admin Controls
                </h3>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="btn-secondary"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                    >
                        Edit Details
                    </button>
                )}
            </div>

            {isEditing ? (
                <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Target URL</label>
                        <input type="text" value={link} onChange={e => setLink(e.target.value)} className="form-control" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label>Position</label>
                            <select value={position} onChange={e => setPosition(e.target.value)} className="form-control">
                                <option value="feed">Feed</option>
                                <option value="sidebar">Sidebar</option>
                                <option value="banner_top">Banner Top</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Budget ($)</label>
                            <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Duration (Days)</label>
                            <input type="number" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} className="form-control" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button onClick={handleSaveDetails} disabled={loading} className="btn-primary">Save Changes</button>
                        <button onClick={() => setIsEditing(false)} disabled={loading} className="btn-secondary">Cancel</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {ad.status === 'active' && (
                        <button 
                            onClick={() => handleStatusChange('paused')} 
                            disabled={loading}
                            className="btn-secondary"
                            style={{ background: '#fef9c3', color: '#854d0e', borderColor: '#fde047' }}
                        >
                            Pause Ad
                        </button>
                    )}
                    
                    {ad.status === 'paused' && (
                        <button 
                            onClick={() => handleStatusChange('active')} 
                            disabled={loading}
                            className="btn-primary"
                            style={{ background: '#22c55e' }}
                        >
                            Resume Ad
                        </button>
                    )}

                    {ad.status !== 'ended' && ad.status !== 'rejected' && (
                        <button 
                            onClick={() => handleStatusChange('ended')} 
                            disabled={loading}
                            className="btn-secondary"
                            style={{ background: '#f1f5f9', color: '#475569' }}
                        >
                            End Campaign
                        </button>
                    )}
                    
                    {ad.status !== 'rejected' && (
                        <button 
                            onClick={() => handleStatusChange('rejected')} 
                            disabled={loading}
                            className="btn-primary"
                            style={{ background: '#ef4444', marginLeft: 'auto' }}
                        >
                            Close / Reject
                        </button>
                    )}
                </div>
            )}
            
            <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                * Actions performed here are logged for audit purposes.
            </p>
        </div>
    );
}