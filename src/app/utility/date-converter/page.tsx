'use client';

import React, { useState } from 'react';
import BikramSambat from 'bikram-sambat';
import Link from 'next/link';

export default function DateConverterPage() {
    const [mode, setMode] = useState<'AD_TO_BS' | 'BS_TO_AD'>('AD_TO_BS');
    const [adDate, setAdDate] = useState(new Date().toISOString().split('T')[0]);
    const [bsDate, setBsDate] = useState('');

    // Initialize BS date
    React.useEffect(() => {
        try {
            const now = new BikramSambat();
            setBsDate(now.format('YYYY-MM-DD'));
        } catch (e) {
            console.error(e);
        }
    }, []);

    const convert = () => {
        try {
            if (mode === 'AD_TO_BS') {
                const bs = new BikramSambat(adDate);
                setBsDate(bs.format('YYYY-MM-DD'));
            } else {
                // BS to AD
                // format expected: YYYY-MM-DD
                const ad = new BikramSambat(bsDate, 'BS').toAD();
                setAdDate(ad.toISOString().split('T')[0]);
            }
        } catch (error) {
            // alert('Invalid Date Format');
        }
    };

    // Auto-convert on change
    React.useEffect(() => {
        convert();
    }, [adDate, bsDate, mode]);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Link href="/utility" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: '600', marginBottom: '24px' }}>
                ← Back to Tools
            </Link>

            <div className="card" style={{ padding: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--color-primary)' }}>Date Converter</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>Convert between Bikram Sambat (BS) and Gregorian (AD) dates.</p>

                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '32px' }}>
                    <button
                        onClick={() => setMode('AD_TO_BS')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            background: mode === 'AD_TO_BS' ? 'white' : 'transparent',
                            boxShadow: mode === 'AD_TO_BS' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            color: mode === 'AD_TO_BS' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            transition: 'all 0.2s'
                        }}
                    >
                        AD to BS
                    </button>
                    <button
                        onClick={() => setMode('BS_TO_AD')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            background: mode === 'BS_TO_AD' ? 'white' : 'transparent',
                            boxShadow: mode === 'BS_TO_AD' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            color: mode === 'BS_TO_AD' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            transition: 'all 0.2s'
                        }}
                    >
                        BS to AD
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>Gregorian (AD)</label>
                        <input
                            type="date"
                            value={adDate}
                            onChange={(e) => {
                                setAdDate(e.target.value);
                                if (mode === 'BS_TO_AD') setMode('AD_TO_BS'); // Switch mode if user types here
                            }}
                            readOnly={mode === 'BS_TO_AD'}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)',
                                fontSize: '1.1rem',
                                color: mode === 'BS_TO_AD' ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                background: mode === 'BS_TO_AD' ? '#f8fafc' : 'white'
                            }}
                        />
                    </div>

                    <div style={{ fontSize: '1.5rem', color: '#cbd5e1' }}>⇄</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>Bikram Sambat (BS)</label>
                        <input
                            type="text"
                            placeholder="YYYY-MM-DD"
                            value={bsDate}
                            onChange={(e) => {
                                setBsDate(e.target.value);
                                if (mode === 'AD_TO_BS') setMode('BS_TO_AD');
                            }}
                            readOnly={mode === 'AD_TO_BS'}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)',
                                fontSize: '1.1rem',
                                color: mode === 'AD_TO_BS' ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                background: mode === 'AD_TO_BS' ? '#f8fafc' : 'white'
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '32px', padding: '16px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.1)', color: '#854d0e', fontSize: '0.9rem' }}>
                    <strong>Note:</strong> Enter BS dates in YYYY-MM-DD format (e.g., 2080-01-01).
                </div>
            </div>
        </div>
    );
}
