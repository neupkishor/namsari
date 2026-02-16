'use client';

import { approveAd, rejectAd } from '@/actions/ads';
import { useState } from 'react';
import Link from 'next/link';

export default function AdActions({ adId, status }: { adId: number, status: string }) {
    const [loading, setLoading] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState('');

    async function handleApprove() {
        if (!confirm('Approve this ad?')) return;
        setLoading(true);
        try {
            await approveAd(adId);
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
            setRejecting(false);
        } catch (err) {
            alert('Failed to reject');
        } finally {
            setLoading(false);
        }
    }

    if (rejecting) {
        return (
            <div style={{ marginTop: '12px' }}>
                <textarea 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder="Reason for rejection..." 
                    className="form-control" 
                    rows={2} 
                    style={{ marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleReject} disabled={!reason} className="btn-primary" style={{ background: '#ef4444' }}>Confirm Reject</button>
                    <button onClick={() => setRejecting(false)} className="btn-secondary">Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Link href={`/manage/advertisements/${adId}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
                View Report
            </Link>
            
            {status === 'pending' && (
                <>
                    <button onClick={handleApprove} disabled={loading} className="btn-primary" style={{ background: '#22c55e' }}>
                        Approve
                    </button>
                    <button onClick={() => setRejecting(true)} disabled={loading} className="btn-primary" style={{ background: '#ef4444' }}>
                        Reject
                    </button>
                </>
            )}
        </div>
    );
}
