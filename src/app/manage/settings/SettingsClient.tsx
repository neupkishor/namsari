'use client';

import React, { useState } from 'react';
import { updateSystemSettings } from '@/actions/settings';

interface SettingsClientProps {
    settings: any;
}

export default function SettingsClient({ settings }: SettingsClientProps) {
    const [saving, setSaving] = useState(false);

    const handleToggle = async (key: string, value: any) => {
        setSaving(true);
        try {
            await updateSystemSettings({ [key]: value });
        } catch (err) {
            console.error(err);
            alert('Failed to update setting');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
            <div>
                <h1 className="section-title">Global Settings</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Configure platform-wide behavior and appearance. Changes affect all users.</p>
            </div>

            {/* Interface View Mode removed */}

            <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px' }}>Social Feed Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <SettingToggle
                        label="Show Like Button"
                        description="Allow users to like properties in the feed."
                        value={settings.show_like_button}
                        onToggle={(v) => handleToggle('show_like_button', v)}
                    />
                    <SettingToggle
                        label="Show Share Button"
                        description="Enable quick sharing options for listings."
                        value={settings.show_share_button}
                        onToggle={(v) => handleToggle('show_share_button', v)}
                    />
                    <SettingToggle
                        label="Show Comment Button"
                        description="Enable public discussion on property listings."
                        value={settings.show_comment_button}
                        onToggle={(v) => handleToggle('show_comment_button', v)}
                    />
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 0' }}></div>
                    <SettingToggle
                        label="Show Contact Agent"
                        description="Display the primary contact button for agents/owners."
                        value={settings.show_contact_agent}
                        onToggle={(v) => handleToggle('show_contact_agent', v)}
                    />
                    <SettingToggle
                        label="Show Make Offer"
                        description="Allow users to submit direct offers to the seller."
                        value={settings.show_make_offer}
                        onToggle={(v) => handleToggle('show_make_offer', v)}
                    />
                </div>
            </div>

            {saving && (
                <div style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    background: 'var(--color-primary-light)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                    Saving global settings...
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function SettingToggle({ label, description, value, onToggle }: { label: string, description: string, value: boolean, onToggle: (v: boolean) => void }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ fontWeight: '700', color: 'var(--color-primary-light)', fontSize: '0.95rem' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{description}</div>
            </div>
            <button
                onClick={() => onToggle(!value)}
                style={{
                    width: '48px',
                    height: '24px',
                    borderRadius: '24px',
                    background: value ? 'var(--color-primary)' : '#cbd5e1',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: value ? '26px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.2s'
                }} />
            </button>
        </div>
    );
}
