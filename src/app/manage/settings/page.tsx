"use client";

import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [viewType, setViewType] = useState('card');

    useEffect(() => {
        const saved = localStorage.getItem('namsari-home-view');
        if (saved) setViewType(saved);
    }, []);

    const handleSave = (type) => {
        setViewType(type);
        localStorage.setItem('namsari-home-view', type);
        alert(`Homepage view updated to ${type === 'feed' ? 'Social Feed' : 'Classic Listing'}`);
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Platform Settings</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Customize your Namsari experience and display preferences.</p>
            </header>

            <section className="card" style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Homepage Display Mode</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                    Select how you want the properties to be presented on the main landing page.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Card View Option */}
                    <div
                        onClick={() => handleSave('card')}
                        style={{
                            cursor: 'pointer',
                            padding: '20px',
                            borderRadius: '12px',
                            border: `2px solid ${viewType === 'card' ? 'var(--color-gold)' : 'var(--color-border)'}`,
                            background: viewType === 'card' ? 'var(--color-surface)' : 'white',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ height: '100px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px' }}>
                            <div style={{ background: 'white', borderRadius: '4px' }} />
                            <div style={{ background: 'white', borderRadius: '4px' }} />
                        </div>
                        <h4 style={{ marginBottom: '4px' }}>Classic Listing</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Professional grid of asset cards with key details.</p>
                    </div>

                    {/* Feed View Option */}
                    <div
                        onClick={() => handleSave('feed')}
                        style={{
                            cursor: 'pointer',
                            padding: '20px',
                            borderRadius: '12px',
                            border: `2px solid ${viewType === 'feed' ? 'var(--color-gold)' : 'var(--color-border)'}`,
                            background: viewType === 'feed' ? 'var(--color-surface)' : 'white',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ height: '100px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px' }}>
                            <div style={{ height: '24px', width: '40%', background: 'white', borderRadius: '4px' }} />
                            <div style={{ flex: 1, background: 'white', borderRadius: '4px' }} />
                        </div>
                        <h4 style={{ marginBottom: '4px' }}>Social Feed</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Dynamic, immersive scroll like a social media platform.</p>
                    </div>
                </div>
            </section>

            <section className="card">
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Global Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: '500' }}>Dark Mode Adaptive</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Sync interface with system preferences.</div>
                        </div>
                        <div style={{ width: '40px', height: '20px', background: 'var(--color-primary)', borderRadius: '20px', position: 'relative' }}>
                            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
