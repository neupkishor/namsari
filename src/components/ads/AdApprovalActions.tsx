'use client';

import { approveAd, rejectAd } from '@/actions/ads';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdApprovalActions({ adId }: { adId: number }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState('');
    const [isSponsoredRel, setIsSponsoredRel] = useState(true);

    async function handleApprove() {
        if (!confirm('Approve this ad?')) return;
        setLoading(true);
        try {
            await approveAd(adId, isSponsoredRel);
            router.push('/manage/advertisements');
        } catch (err) {
            alert('Failed to approve');
        } finally {
            setLoading(false);
        }
    }

    async function handleReject() {
        if (!reason) return;
        setLoading(true);
        try {
            await rejectAd(adId, reason);
            router.push('/manage/advertisements');
        } catch (err) {
            alert('Failed to reject');
        } finally {
            setLoading(false);
        }
    }

    if (rejecting) {
        return (
            <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#991b1b' }}>Reject Advertisement</h3>
                <textarea 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder="Reason for rejection..." 
                    className="form-control" 
                    rows={3} 
                    style={{ marginBottom: '16px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleReject} disabled={!reason || loading} className="btn-primary" style={{ background: '#ef4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        {loading ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                    <button onClick={() => setRejecting(false)} disabled={loading} className="btn-secondary" style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Approval Actions</h3>
            
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input 
                        type="checkbox" 
                        checked={isSponsoredRel} 
                        onChange={e => setIsSponsoredRel(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                        Use <code>rel="sponsored"</code> for this link
                    </span>
                </label>
                <p style={{ marginTop: '4px', fontSize: '0.85rem', color: '#64748b', marginLeft: '30px' }}>
                    Recommended for paid advertisements to comply with SEO guidelines.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleApprove} disabled={loading} className="btn-primary" style={{ background: '#22c55e', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    {loading ? 'Processing...' : 'Approve Advertisement'}
                </button>
                <button onClick={() => setRejecting(true)} disabled={loading} className="btn-primary" style={{ background: '#ef4444', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    Reject
                </button>
            </div>
        </div>
    );
}